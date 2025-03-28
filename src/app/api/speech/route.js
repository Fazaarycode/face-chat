import { NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';


// Initialize the Speech-to-Text client
const speechClient = new SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

export async function POST(request) {
  try {
    const { audioData } = await request.json();
    console.log('process.env.GOOGLE_APPLICATION_CREDENTIALS::: ', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('process.env.GOOGLE_APPLICATION_CREDENTIALS parsed::: ', JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    // return;
    // Configure the recognition settings
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      model: 'default',
      audioChannelCount: 1,
    };

  

    // Create the audio input object
    const audio = {
      content: audioData,
    };

    console.log('Sending request with config:', config);

    // Perform the transcription
    const [response] = await speechClient.recognize({
      config: config,
      audio: audio,
    });
    
    console.log('Full API response:', response);

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return NextResponse.json({ 
      success: true,
      transcription 
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Speech-to-text failed',
      details: error.message
    }, { status: 500 });
  }
} 