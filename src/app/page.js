'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Box, Typography, Container } from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, message: '', severity: 'error' });
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
      
      // First set the state to render the video element
      setIsCameraStarted(true);
      
      // Wait for the next render cycle
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

  // Add effect to handle video element initialization
  useEffect(() => {
    if (isCameraStarted && videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error);
      };
    }
  }, [isCameraStarted]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!videoRef.current?.srcObject) {
      setAlertState({
        open: true,
        message: 'Please start the camera first',
        severity: 'warning'
      });
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
      formData.append('type', 'login');

      const response = await fetch('/api/auth', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('data---::: ', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        username: data.user.username
      }));

      // Show success message before redirect
      setAlertState({
        open: true,
        message: 'Login successful!',
        severity: 'success'
      });

      stopCamera();
      router.push('/chat');

    } catch (error) {
      setAlertState({
        open: true,
        message: error.message || 'Login failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup effect
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
            Login
          </Typography>
          
          <form onSubmit={handleLogin}>
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
                    {isLoading ? 'Verifying...' : 'Login with Face ID'}
                  </Button>
                </Box>
              )}
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
            Don&apos;t have an account?{' '}
              <Button
                variant="text"
                color="primary"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </Card>

        <Alert
          open={alertState.open}
          message={alertState.message}
          severity={alertState.severity}
          onClose={() => setAlertState({ ...alertState, open: false })}
        />
      </Box>
    </Container>
  );
}
