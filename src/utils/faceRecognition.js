import { RekognitionClient, CompareFacesCommand, DetectFacesCommand } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function detectFace(imageBuffer) {
  try {
    const command = new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer
      },
      Attributes: ['DEFAULT']
    });

    const response = await rekognition.send(command);
    return response.FaceDetails.length > 0;
  } catch (error) {
    console.error('Error detecting face:', error);
    throw error;
  }
}

export async function compareFaces(sourceImageBuffer, targetImageBuffer) {
  try {
    const command = new CompareFacesCommand({
      SourceImage: {
        Bytes: sourceImageBuffer
      },
      TargetImage: {
        Bytes: targetImageBuffer
      },
      SimilarityThreshold: 90
    });

    const response = await rekognition.send(command);
    return response.FaceMatches.length > 0;
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw error;
  }
} 