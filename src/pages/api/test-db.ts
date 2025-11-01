import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect ke MongoDB
    await connectDB();

    // Test query: Ambil 5 produk
    const products = await Product.find({ isActive: true })
      .limit(5)
      .select('name price category')
      .lean();

    // Test query: Ambil jumlah total users
    const userCount = await User.countDocuments();

    // Success response
    res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      data: {
        productsCount: products.length,
        products: products,
        totalUsers: userCount,
      },
    });
  } catch (error) {
    // Error response
    res.status(500).json({
      success: false,
      message: 'Database connection failed!',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
