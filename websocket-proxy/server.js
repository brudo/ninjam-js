import { WebSocketServer } from 'ws';
import net from 'net';
import { Buffer } from 'buffer';

const PORT = process.env.PORT || 8080;
const MAX_CONNECTIONS = 100;

class NinjamWebSocketProxy {
  constructor(port) {
    this.port = port;
    this.connections = new Map(); // WebSocket -> TCP socket mapping
    this.wss = new WebSocketServer({ 
      port: this.port,
      maxPayload: 1024 * 1024 // 1MB max payload
    });
    
    console.log(`NINJAM WebSocket Proxy starting on port ${this.port}`);
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientIP = req.socket.remoteAddress;
      console.log(`WebSocket connection from ${clientIP}`);

      // Check connection limit
      if (this.connections.size >= MAX_CONNECTIONS) {
        console.log(`Connection limit reached, rejecting ${clientIP}`);
        ws.close(1013, 'Server overloaded');
        return;
      }

      // Handle WebSocket messages
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data);
      });

      // Handle WebSocket close
      ws.on('close', () => {
        this.handleWebSocketClose(ws);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientIP}:`, error);
        this.handleWebSocketClose(ws);
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server error:', error);
    });
  }

  handleWebSocketMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'connect':
          this.handleConnect(ws, message);
          break;
        case 'data':
          this.handleData(ws, message);
          break;
        case 'disconnect':
          this.handleDisconnect(ws);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  }

  handleConnect(ws, message) {
    const { host, port } = message;
    
    // Validate host and port
    if (!host || !port || port < 1 || port > 65535) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid host or port'
      }));
      return;
    }

    // Security: Only allow connections to known NINJAM servers or localhost for testing
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'autosong.ninjam.com',
      'jam.ninbot.com',
      'ninjam.llama.org'
    ];

    if (!allowedHosts.some(allowed => host.includes(allowed))) {
      console.warn(`Blocked connection attempt to: ${host}`);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Host not allowed'
      }));
      return;
    }

    console.log(`Connecting to NINJAM server: ${host}:${port}`);

    // Create TCP connection to NINJAM server
    const tcpSocket = net.createConnection({ host, port }, () => {
      console.log(`Connected to ${host}:${port}`);
      ws.send(JSON.stringify({
        type: 'connected',
        host,
        port
      }));
    });

    // Store the TCP socket for this WebSocket connection
    this.connections.set(ws, tcpSocket);

    // Handle TCP data from NINJAM server
    tcpSocket.on('data', (data) => {
      if (ws.readyState === ws.OPEN) {
        // Convert binary data to base64 for JSON transport
        const base64Data = data.toString('base64');
        ws.send(JSON.stringify({
          type: 'data',
          data: base64Data
        }));
      }
    });

    // Handle TCP connection end
    tcpSocket.on('end', () => {
      console.log('NINJAM server closed connection');
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'disconnected',
          reason: 'Server closed connection'
        }));
      }
      this.connections.delete(ws);
    });

    // Handle TCP errors
    tcpSocket.on('error', (error) => {
      console.error(`TCP connection error to ${host}:${port}:`, error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: `Connection failed: ${error.message}`
        }));
      }
      this.connections.delete(ws);
    });

    // Handle TCP connection timeout
    tcpSocket.setTimeout(30000, () => {
      console.log(`TCP connection timeout to ${host}:${port}`);
      tcpSocket.destroy();
    });
  }

  handleData(ws, message) {
    const tcpSocket = this.connections.get(ws);
    if (!tcpSocket) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'No active TCP connection'
      }));
      return;
    }

    try {
      // Convert base64 data back to binary
      const binaryData = Buffer.from(message.data, 'base64');
      tcpSocket.write(binaryData);
    } catch (error) {
      console.error('Error writing to TCP socket:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send data'
      }));
    }
  }

  handleDisconnect(ws) {
    const tcpSocket = this.connections.get(ws);
    if (tcpSocket) {
      tcpSocket.end();
      this.connections.delete(ws);
    }
  }

  handleWebSocketClose(ws) {
    const tcpSocket = this.connections.get(ws);
    if (tcpSocket) {
      tcpSocket.destroy();
      this.connections.delete(ws);
    }
    console.log('WebSocket connection closed');
  }

  getStats() {
    return {
      activeConnections: this.connections.size,
      maxConnections: MAX_CONNECTIONS,
      uptime: process.uptime()
    };
  }
}

// Create and start the proxy server
const proxy = new NinjamWebSocketProxy(PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  proxy.wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  proxy.wss.close(() => {
    process.exit(0);
  });
});

// Status endpoint for health checks
const statusInterval = setInterval(() => {
  const stats = proxy.getStats();
  console.log(`Status: ${stats.activeConnections} active connections, uptime: ${Math.floor(stats.uptime)}s`);
}, 60000); // Log every minute

export default NinjamWebSocketProxy;