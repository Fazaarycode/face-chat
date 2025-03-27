'use client';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SpeechToText from './SpeechToText';

export default function ChatRoom({ room, username }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit('joinRoom', room);

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [room]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit('sendMessage', {
        room,
        message,
        username
      });
      setMessage('');
    }
  };

  const handleTranscription = (text) => {
    setMessage(text); // Set transcribed text to message input
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <span className="font-bold">{msg.username}: </span>
            <span>{msg.message}</span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(msg.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
          <SpeechToText onTranscription={handleTranscription} />
        </div>
      </div>
    </div>
  );
}
