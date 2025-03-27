'use client';
import { useState } from 'react';

export default function SpeechRecognition({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscription(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <button 
      onClick={startRecording}
      disabled={isRecording}
    >
      {isRecording ? 'Listening...' : '🎤 Start Speaking'}
    </button>
  );
} 