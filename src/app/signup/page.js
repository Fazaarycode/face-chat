'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container } from '@mui/material';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setIsCameraStarted(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please ensure camera permissions are granted.');
      setIsCameraStarted(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraStarted(false);
  };

  useEffect(() => {
    if (isCameraStarted && videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error);
      };
    }
  }, [isCameraStarted]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!videoRef.current?.srcObject) {
      alert('Please start the camera first');
      return;
    }

    setIsLoading(true);

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('image', blob);
      formData.append('type', 'signup');

      const response = await fetch('/api/auth', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      stopCamera();
      router.push('/'); // Redirect to login page

    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card>
          <Typography variant="h4" gutterBottom align="center">
            Sign Up
          </Typography>
          
          <form onSubmit={handleSignup}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />

              {!isCameraStarted ? (
                <Button
                  onClick={startCamera}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Start Camera
                </Button>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={isLoading}
                    fullWidth
                  >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Box>
              )}
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Button
                variant="text"
                color="primary"
                onClick={() => router.push('/')}
              >
                Login
              </Button>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container>
  );
} 