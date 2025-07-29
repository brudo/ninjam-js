import NodeNetSocket from './node-net-socket';
import ChromeNetSocket from './chrome-net-socket';
import MozNetSocket from './moz-net-socket';
import WebSocketNetSocket from './websocket-net-socket';

let impl = null;
if (typeof global.require !== 'undefined' && global.require('net')) {
  impl = NodeNetSocket;
}
else if (typeof chrome !== 'undefined' && chrome.sockets) {
  impl = ChromeNetSocket;
}
else if (navigator.mozTCPSocket) {
  impl = MozNetSocket;
}
else if (typeof WebSocket !== 'undefined') {
  // Use WebSocket proxy for browsers that don't support direct TCP
  impl = WebSocketNetSocket;
}
else {
  // Throw some kind of error
  throw new Error('No supported TCP socket implementation found');
}

export default impl;
