'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ChatMessages from '../../../components/ChatMessages';
import { Box, Typography, Container } from '@mui/material';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { toast } from 'sonner'; // Make sure to install: npm install sonner

export default function RoomPage({ params }) {
  const roomId = use(params).roomId;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/');
    }
  }, []);

  useEffect(() => {
    // ... existing code ...
  }, [router]); // Add router to dependency array

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16,
          volume: 1.0
        }
      });
      
      const audioChunks = [];  // Create array to store chunks
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log('Chunk added:', event.data.size); // Debug log
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        console.log('Final blob size:', audioBlob.size); // Debug log
        const audioUrl = URL.createObjectURL(audioBlob);
        setTestAudioUrl(audioUrl);
        
        // Convert blob to base64 using a Promise
        const base64Audio = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result
              .replace('data:audio/webm;codecs=opus;base64,', '')
              .replace('data:audio/webm;base64,', '');
            resolve(base64String);
          };
          reader.readAsDataURL(audioBlob);
        });

        console.log('Base64 length:', base64Audio.length); // Debug log
        
        try {
          const response = await fetch('/api/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioData: base64Audio }),
          });

          if (!response.ok) {
            throw new Error('Speech API request failed');
          }

          const data = await response.json();
          console.log('API response:', data); // Debug log
          if (data.transcription) {
            setMessage(data.transcription);
          }
        } catch (error) {
          console.error('Speech API error:', error);
          toast.error('Failed to process speech');
        }
      };

      setMediaRecorder(recorder);
      recorder.start(100); // Request data every 100ms
      setIsRecording(true);
      setIsListening(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone');
    }
  };

  const createTestAudioUrl = (audioData) => {
    // Convert base64 to blob
    const binStr = atob(audioData);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    const blob = new Blob([arr], { type: 'audio/webm' });
    
    // Create and save URL
    const url = URL.createObjectURL(blob);
    setTestAudioUrl(url);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsListening(false);
      
      // Stop all tracks in the stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      if (testAudioUrl) {
        URL.revokeObjectURL(testAudioUrl);
      }
    };
  }, [testAudioUrl]);

  const sendMessage = () => {
    if (!message.trim() || !user) return;

    if (window.socket) {
      const messageData = {
        content: message,
        sender: user.id,
        senderName: user.username,
        roomId: roomId
      };
      
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
    <Container maxWidth="md" className="py-8">
      <Card>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button onClick={() => router.push('/chat')}>
            Back to Rooms
          </Button>
          <Typography variant="h5">Room: {roomId}</Typography>
        </Box>
      </Card>

      <ChatMessages 
        room={roomId}
        username={user?.username || 'Guest'}
        onMessage={(message) => {
          console.log('Received message:', message);
        }}
      />

      <Card mt={4}>
        <Box display="flex" flexDirection="column" p={2} gap={2}>
          {isListening && (
            <div className="text-sm text-blue-500 animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"/>
              Listening... Click microphone to stop
            </div>
          )}
          <Box display="flex" alignItems="center" gap={2}>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <div className="relative">
              {isListening && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-blue-500 bg-white px-2 py-1 rounded-md shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"/>
                    Listening...
                  </div>
                </div>
              )}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant="icon"
                className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isRecording ? <MicOffIcon /> : <MicIcon />}
              </Button>
            </div>
            {testAudioUrl && (
              <audio 
                controls 
                src={testAudioUrl}
                className="h-10"
              />
            )}
            <Button onClick={sendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      </Card>
    </Container>
  );
} 