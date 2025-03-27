import { SpeechClient } from '@google-cloud/speech';

// Initialize the Speech-to-Text client
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = req.body; // Base64 encoded audio

    // Configure the recognition settings
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    // Create the audio input object
    const audio = {
      content: audioData,
    };

    // Perform the transcription
    const [response] = await speechClient.recognize({
      config: config,
      audio: audio,
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.status(200).json({ 
      success: true,
      transcription 
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Speech-to-text failed' });
  }
}
