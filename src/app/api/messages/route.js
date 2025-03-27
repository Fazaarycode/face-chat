import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Message from '@/models/Message';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get roomId from query params
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Find messages for the specific room
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 });

    console.log(`Found ${messages.length} messages for room ${roomId}`);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 