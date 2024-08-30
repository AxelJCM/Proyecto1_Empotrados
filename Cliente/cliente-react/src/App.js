import React, { useState, useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://localhost:8080');

function App() {
  const [message, setMessage] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      setServerMessage(message.data);
    };

    return () => {
      client.close();
    };
  }, []);

  const sendMessage = () => {
    client.send(message);
  };

  return (
    <div className="App">
      <h1>React WebSocket Client</h1>
      <input 
        type="text" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Escribe un mensaje"
      />
      <button onClick={sendMessage}>Enviar al Servidor</button>
      <h2>Mensaje del Servidor: {serverMessage}</h2>
    </div>
  );
}

export default App;

