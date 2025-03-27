import { RekognitionClient, CompareFacesCommand, DetectFacesCommand } from "@aws-sdk/client-rekognition";
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI, {
  ssl: true,
  tls: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
});

// AWS Rekognition setup
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  credentialDefaultProvider: () => () => Promise.reject(
    new Error('Credentials not available')
  ),
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const image = formData.get('image');
    const type = formData.get('type'); // 'signup' or 'login'

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Detect face in the uploaded image
    const detectCommand = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: ['DEFAULT']
    });

    const detectResponse = await rekognition.send(detectCommand);

    if (detectResponse.FaceDetails.length === 0) {
      return NextResponse.json({ error: 'No face detected' }, { status: 400 });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db('fazaarydemo');
    const users = db.collection('users');

    if (type === 'signup') {
      // Check if username already exists
      const existingUser = await users.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store user data
      await users.insertOne({
        username,
        password: hashedPassword,
        faceImage: imageBuffer.toString('base64'), // Store image as base64
        createdAt: new Date()
      });

      return NextResponse.json({ success: true, message: 'User created successfully' });

    } else if (type === 'login') {
      // Find user
      const user = await users.findOne({ username });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      // Compare faces
      const compareCommand = new CompareFacesCommand({
        SourceImage: {
          Bytes: Buffer.from(user.faceImage, 'base64')
        },
        TargetImage: {
          Bytes: imageBuffer
        },
        SimilarityThreshold: 90
      });

      const compareResponse = await rekognition.send(compareCommand);

      if (compareResponse.FaceMatches.length === 0) {
        return NextResponse.json({ error: 'Face verification failed' }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user._id.toString(), // Convert ObjectId to string
          username: user.username
        }
      });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed: ' + error.message }, 
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    await client.close();
  }
} 