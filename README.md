# Face ID Chat Application

This is a Next.js-based chat application with Face ID authentication and speech-to-text capabilities.

## Features

- **Advanced Authentication**
  - Face ID login integration
  - Traditional username/password login
  - Combined Face ID + credentials authentication
  - Default credentials: username: `faz`, password: `faz`

- **Real-time Chat System**
  - Socket.io based real-time messaging
  - Multiple chat rooms support
  - Message history persistence

- **Speech-to-Text Integration**
  - Google Cloud Speech-to-Text API integration
  - Live microphone input support
  - Audio playback verification feature

- **Technical Stack**
  - Next.js API routes for backend management
  - MongoDB database for storing:
    - User profiles and face data
    - Chat rooms
    - Message history
    - Authentication data
  - Vercel deployment

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Important Notes

### Microphone Setup
- Ensure your microphone is properly configured
- Test audio playback to verify microphone functionality
- Speech-to-text service will only work with a working microphone

### User Registration
1. Use the sign-up feature to create a new account
2. Register your face during the sign-up process
3. Complete the registration with username and password

### Default Test Account
- Username: faz
- Password: faz
- You need me for this - You can use the sign-up feature to create a new account

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
- [MongoDB Documentation](https://docs.mongodb.com)

## Deployment

This application is deployed on [Vercel Platform](https://vercel.com). Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.