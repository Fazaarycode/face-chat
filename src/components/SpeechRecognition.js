'use client';

import { useState, useEffect } from 'react';

export default function SpeechRecognition({ onTranscription }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        onTranscription(transcript);
      };

      setRecognition(recognition);
    }
  }, [onTranscription]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  if (!recognition) {
    return null; // Or show a message that speech recognition is not supported
  }

  return (
    <button
      onClick={toggleListening}
      className={`px-4 py-2 rounded ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-green-500 hover:bg-green-600'
      } text-white transition-colors`}
    >
      {isListening ? 'Stop Listening' : 'Start Listening'}
    </button>
  );
} 