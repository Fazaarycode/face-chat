"use client"
import { AppBar, Toolbar, Typography, Button, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/chat')}
        >
          FaceChat
        </Typography>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user.username[0].toUpperCase()}
            </Avatar>
            <Typography variant="body1">{user.username}</Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
} 