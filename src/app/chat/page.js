'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatHome() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const router = useRouter();
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

  useEffect(() => {
    // Load existing rooms
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  const createRoom = async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoomName })
    });
    const newRoom = await response.json();
    router.push(`/rooms/${newRoom._id}`);
  };

  return (
    <div>
      <div>
        <input
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Room name"
        />
        <button onClick={createRoom}>Create Room</button>
      </div>
      
      <div>
        {rooms.map(room => (
          <div 
            key={room._id}
            onClick={() => router.push(`/rooms/${room._id}`)}
          >
            {room.name}
          </div>
        ))}
      </div>
    </div>
  );
} 