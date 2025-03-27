'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch rooms from your API
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error('Error fetching rooms:', err));
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoomName }),
      });
      const newRoom = await res.json();
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Chat Rooms</h1>
      
      {/* Create Room Form */}
      <form onSubmit={createRoom} className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name"
            className="flex-1 border p-2 rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create Room
          </button>
        </div>
      </form>

      {/* Rooms List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div 
            key={room._id} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/rooms/${room._id}`)}
          >
            <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
            <p className="text-gray-500 text-sm">
              Created: {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No rooms available. Create one to get started!
        </p>
      )}
    </div>
  );
}

export default RoomsPage; 