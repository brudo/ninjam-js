import BaseNetSocket from './base-net-socket';

/**
 * NetSocket implementation using WebSocket proxy for browsers
 */
export default class WebSocketNetSocket extends BaseNetSocket {
  constructor(options) {
    super(options);
    this.proxyUrl = options.proxyUrl || 'ws://localhost:8080';
    this.ws = null;
    this.connected = false;
    this.connecting = false;

    // Just send the oncreate event now
    this.notify('create', true);
  }

  connect(host, port) {
    if (this.connecting || this.connected) {
      console.warn('Already connecting or connected');
      return;
    }

    this.connecting = true;
    console.log(`Connecting to NINJAM server ${host}:${port} via WebSocket proxy`);

    try {
      this.ws = new WebSocket(this.proxyUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket proxy connection established');
        // Send connect request to proxy
        this.ws.send(JSON.stringify({
          type: 'connect',
          host: host,
          port: port
        }));
      };

      this.ws.onmessage = (event) => {
        this.handleProxyMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket proxy connection closed:', event.code, event.reason);
        this.connected = false;
        this.connecting = false;
        this.notify('close', {
          code: event.code,
          reason: event.reason
        });
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket proxy error:', error);
        this.connected = false;
        this.connecting = false;
        this.notify('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connecting = false;
      this.notify('error', error);
    }
  }

  handleProxyMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'connected':
          console.log(`Connected to NINJAM server via proxy: ${message.host}:${message.port}`);
          this.connected = true;
          this.connecting = false;
          this.notify('connect', true);
          break;

        case 'data':
          // Convert base64 data back to ArrayBuffer
          const binaryString = atob(message.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.notify('receive', bytes.buffer);
          break;

        case 'disconnected':
          console.log('NINJAM server disconnected:', message.reason);
          this.connected = false;
          this.notify('disconnect', message.reason);
          break;

        case 'error':
          console.error('Proxy error:', message.message);
          this.connected = false;
          this.connecting = false;
          this.notify('error', new Error(message.message));
          break;

        default:
          console.warn('Unknown proxy message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing proxy message:', error);
      this.notify('error', error);
    }
  }

  send(data) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send data: not connected to proxy');
      return false;
    }

    try {
      // Convert ArrayBuffer to base64 for JSON transport
      const uint8Array = new Uint8Array(data);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64Data = btoa(binaryString);

      this.ws.send(JSON.stringify({
        type: 'data',
        data: base64Data
      }));

      this.notify('send', data);
      return true;
    } catch (error) {
      console.error('Error sending data via proxy:', error);
      this.notify('error', error);
      return false;
    }
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'disconnect'
      }));
    }
    this.close();
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.connecting = false;
  }

  isConnected() {
    return this.connected;
  }
}