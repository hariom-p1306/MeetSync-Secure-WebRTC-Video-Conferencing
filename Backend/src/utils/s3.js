import dotenv from "dotenv";
dotenv.config();

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generateUploadUrl = async ({ fileName, fileType }) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5,
  });
};

export const generateDownloadUrl = async ({ fileName }) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 10,
  });
};