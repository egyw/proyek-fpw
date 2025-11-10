import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
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
    const { folder } = req.body;

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters to sign
    const params = {
      timestamp,
      folder: folder || 'proyekFPW/product_assets',
      // Add more params if needed: transformation, tags, etc.
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    // Return signature + timestamp + api_key
    res.status(200).json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder: params.folder,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
