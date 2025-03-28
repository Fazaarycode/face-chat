import { NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import dbConnect from '@/utils/db';
import Message from '@/models/Message';

let io;

if (!global.io) {
  console.log('Initializing Socket.IO server...');
  io = new SocketIOServer(3001, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? false 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"]
    }
  });

  // Add debounce to logging
  const logWithDebounce = debounce((message) => {
    console.log(message);
  }, 5000); // Only log once every 5 seconds

  io.on('connection', async (socket) => {
    logWithDebounce(`Socket connected: ${socket.id}`);

    socket.on('join-room', async (roomId) => {
      socket.join(roomId);
      logWithDebounce(`Socket ${socket.id} joined room ${roomId}`);

      // Send message history when joining room
      try {
        await dbConnect();
        const messages = await Message.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(100); // Limit to last 100 messages
        socket.emit('message-history', messages);
      } catch (error) {
        console.error('Error fetching message history:', error);
      }
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      logWithDebounce(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('send-message', async (data) => {
      console.log('data::: ', data);
      try {
        await dbConnect();
        // Store message in MongoDB
        const message = await Message.create({
          content: data.content,
          sender: data.sender,
          senderName: data.senderName,
          roomId: data.roomId,
          timestamp: new Date()
        });

        // Broadcast message to room
        io.to(data.roomId).emit('new-message', message);
      } catch (error) {
        console.error('Error storing message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logWithDebounce(`Socket disconnected: ${socket.id}`);
    });
  });

  global.io = io;
}

// Simple debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST() {
  return NextResponse.json({ success: true });
} 