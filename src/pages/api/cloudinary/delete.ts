import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (server-side only, API Secret aman di sini)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json({ success: true, result });
    } else if (result.result === 'not found') {
      return res.status(404).json({ success: false, error: 'Image not found', result });
    } else {
      return res.status(400).json({ success: false, error: 'Delete failed', result });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
