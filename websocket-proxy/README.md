# NINJAM WebSocket Proxy

A WebSocket-to-TCP proxy server that enables web browsers (including Safari on iPad) to connect to NINJAM servers.

## Overview

This proxy bridges the gap between browser-based NINJAM clients and traditional NINJAM servers by:
- Accepting WebSocket connections from browsers
- Establishing TCP connections to NINJAM servers
- Transparently forwarding binary data between the connections

## Features

- **Security**: Only allows connections to whitelisted NINJAM servers
- **Performance**: Efficient binary data handling with base64 encoding for WebSocket transport
- **Scalability**: Connection limits and resource management
- **Monitoring**: Built-in logging and health checks
- **Cloud Ready**: Docker support for easy deployment

## Quick Start

### Local Development

```bash
cd websocket-proxy
npm install
npm run dev
```

The proxy will start on port 8080 (or the PORT environment variable).

### Docker Deployment

```bash
cd websocket-proxy
docker build -t ninjam-proxy .
docker run -p 8080:8080 ninjam-proxy
```

Or use docker-compose:

```bash
docker-compose up -d
```

## Client Configuration

Update your NINJAM client to use the WebSocket proxy by configuring the `WebSocketNetSocket`:

```javascript
import NetSocket from './net-socket';

// The client will automatically use WebSocket proxy in browsers
const socket = new NetSocket({
  proxyUrl: 'ws://your-proxy-server:8080', // Optional: defaults to ws://localhost:8080
  onCreate: () => console.log('Socket created'),
  onConnect: () => console.log('Connected to NINJAM server'),
  onReceive: (data) => console.log('Received data'),
  onError: (error) => console.error('Socket error:', error),
  onDisconnect: () => console.log('Disconnected'),
  onClose: () => console.log('Connection closed')
});

socket.connect('autosong.ninjam.com', 2049);
```

## Protocol

The proxy uses JSON messages over WebSocket:

### Client to Proxy

```javascript
// Connect to NINJAM server
{
  "type": "connect",
  "host": "autosong.ninjam.com",
  "port": 2049
}

// Send binary data (base64 encoded)
{
  "type": "data", 
  "data": "base64encodeddata"
}

// Disconnect
{
  "type": "disconnect"
}
```

### Proxy to Client

```javascript
// Connection established
{
  "type": "connected",
  "host": "autosong.ninjam.com", 
  "port": 2049
}

// Binary data from server (base64 encoded)
{
  "type": "data",
  "data": "base64encodeddata"
}

// Server disconnected
{
  "type": "disconnected",
  "reason": "Server closed connection"
}

// Error occurred
{
  "type": "error",
  "message": "Error description"
}
```

## Security

- **Host Whitelist**: Only allows connections to approved NINJAM servers
- **Connection Limits**: Maximum 100 concurrent connections
- **Resource Limits**: 1MB maximum WebSocket payload
- **Timeout Handling**: 30-second TCP connection timeout

Approved servers:
- localhost / 127.0.0.1 (for testing)
- autosong.ninjam.com
- jam.ninbot.com  
- ninjam.llama.org

## Cloud Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Heroku

```bash
# Install Heroku CLI and deploy
heroku create your-ninjam-proxy
git push heroku main
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/ninjam-proxy
gcloud run deploy --image gcr.io/PROJECT-ID/ninjam-proxy --platform managed
```

## Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment mode (development/production)

## Monitoring

The server logs connection statistics every minute and provides health check endpoints for container orchestration.

## Browser Compatibility

Works in all modern browsers that support:
- WebSocket API
- ArrayBuffer/Uint8Array
- Base64 encoding (atob/btoa)

Tested on:
- Chrome/Chromium
- Firefox  
- Safari (including iPad)
- Edge