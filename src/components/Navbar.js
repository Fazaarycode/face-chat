"use client"
import { AppBar, Toolbar, Typography, Button, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };

    // Check user data on mount
    handleStorageChange();

    // Listen for changes to localStorage
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
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

        {user ? (
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
        ) : (
          <Button 
            color="inherit" 
            onClick={() => router.push('/')}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
} 