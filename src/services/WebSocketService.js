let websocket = null;
let callback = null;

export function connect(userId) {
  websocket = new WebSocket(`ws://localhost:8089/chat?userId=${userId}`);

  websocket.onopen = () => {
    console.log('WebSocket connection opened.');
  };

  websocket.onmessage = (event) => {
    if (callback) {
      callback(JSON.parse(event.data));
    }
  };

  websocket.onclose = () => {
    console.log('WebSocket connection closed.');
  };
}

export function sendMessage(message) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(message));
  }
}

export function setMessageCallback(cb) {
  callback = cb;
}
