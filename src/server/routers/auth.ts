import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const registerInputSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  phone: z.string().regex(/^08\d{8,11}$/, 'Nomor HP harus diawali 08 dan 10-13 digit'),
  address: z.object({
    street: z.string().min(1, 'Alamat harus diisi'),
    city: z.string().min(1, 'Kota harus diisi'),
    province: z.string().min(1, 'Provinsi harus diisi'),
    postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit'),
  }),
});

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ input }: { input: z.infer<typeof registerInputSchema> }) => {
      // Validate password confirmation
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password dan konfirmasi password tidak cocok',
        });
      }

      // Connect to database
      await connectDB();

      // Check if username already exists
      const existingUsername = await User.findOne({ username: input.username });
      if (existingUsername) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username sudah digunakan',
        });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email: input.email });
      if (existingEmail) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email sudah terdaftar',
        });
      }

      // Hash password
      const hashedPassword = await hash(input.password, 10);

      // Create new user
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        role: 'user', // Default role for new registration
        isActive: true,
      });

      // Return success response (don't include password)
      return {
        success: true,
        message: 'Registrasi berhasil! Silakan login.',
        user: {
          id: String(user._id),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      };
    }),

  // NOTE: Login functionality now handled by NextAuth (see src/pages/api/auth/[...nextauth].ts)
  // This tRPC login endpoint is no longer used but kept for reference
});
