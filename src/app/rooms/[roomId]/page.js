'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ChatMessages from '../../../components/ChatMessages';
import SpeechRecognition from '../../../components/SpeechRecognition';
import { useSession } from 'next-auth/react';

export default function RoomPage({ params }) {
  const roomId = use(params).roomId;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data found
      router.push('/');
    }
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !user) return;

    if (window.socket) {
      const messageData = {
        content: message,
        sender: user.id,
        senderName: user.username,
        roomId: roomId
      };
      
      console.log('Sending message:', messageData);
      window.socket.emit('send-message', messageData);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and room info */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow p-4">
        <button 
          onClick={() => router.push('/rooms')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Rooms
        </button>
        <h1 className="text-xl font-bold">Room: {roomId}</h1>
      </div>

      {/* Chat Messages */}
      <ChatMessages 
        room={roomId}
        username={session?.user?.name || 'Guest'}
      />

      {/* Message Input Area */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border p-2 rounded"
            placeholder="Type your message..."
          />
          <SpeechRecognition 
            onTranscription={(text) => {
              setMessage(text);
            }}
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 