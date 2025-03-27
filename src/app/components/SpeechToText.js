'use client';
import { useState, useCallback } from 'react';

export default function SpeechToText({ onTranscription }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const startListening = useCallback(() => {
    setError('');
    setTranscript('');

    // Check browser support
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (event.results[current].isFinal) {
        onTranscription(transcript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Error occurred in recognition: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [onTranscription]);

  return (
    <div className="speech-to-text">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`p-2 rounded-full ${
          isListening 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isListening ? '🎤 Listening...' : '🎤 Start Speaking'}
      </button>
      
      {transcript && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 