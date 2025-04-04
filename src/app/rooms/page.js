'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container } from '@mui/material';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chat Rooms
        </Typography>

        <form onSubmit={createRoom}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Input
              fullWidth
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
            />
            <Button 
              type="submit"
              variant="contained"
              color="primary"
            >
              Create Room
            </Button>
          </Box>
        </form>

        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {rooms.map((room) => (
            <Card 
              key={room._id} 
              sx={{ p: 2, cursor: 'pointer' }}
              onClick={() => router.push(`/rooms/${room._id}`)}
            >
              <Typography variant="h6">{room.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(room.createdAt).toLocaleDateString()}
              </Typography>
            </Card>
          ))}
        </Box>

        {rooms.length === 0 && (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
            No rooms available. Create one to get started!
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default RoomsPage; 