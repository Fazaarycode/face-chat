'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

let socket;

export default function ChatMessages({ room, username }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add this function to fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?roomId=${room}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      console.log('Fetched messages:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(); // Fetch messages when component mounts
    
    const socketInitializer = async () => {
      try {
        await fetch('/api/socket');
        
        socket = io('http://localhost:3001', {
          transports: ['websocket'],
          reconnectionAttempts: 5
        });

        socket.on('connect', () => {
          console.log('Socket connected with ID:', socket.id);
          setConnected(true);
          socket.emit('join-room', room);
        });

        socket.on('new-message', (message) => {
          console.log('New message received:', message);
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          setConnected(false);
        });

        // Make socket available globally for sending messages
        window.socket = socket;

      } catch (error) {
        console.error('Socket initialization error:', error);
        setLoading(false);
      }
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.emit('leave-room', room);
        socket.disconnect();
      }
    };
  }, [room]);

  // Debug render
  console.log('Current messages:', messages);
  console.log('Connection status:', connected);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-96 overflow-y-auto">
      {!connected && (
        <div className="text-center text-yellow-500 mb-4">
          Connecting to chat...
        </div>
      )}
      
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-lg px-4 py-2 max-w-[70%] ${
                  message.sender === username 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100'
                }`}
              >
                <p className="text-sm font-semibold">{message.sender}</p>
                <p>{message.content}</p>
                <p className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 