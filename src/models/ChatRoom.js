import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the chat room'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', ChatRoomSchema); 