import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        // Connect to database
        await connectDB();

        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('Email atau password salah');
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error('Akun Anda tidak aktif. Hubungi administrator.');
        }

        // Verify password
        const isValidPassword = await compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Email atau password salah');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Return user object (will be stored in JWT)
        return {
          id: String(user._id),
          email: user.email,
          name: user.fullName,
          username: user.username,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses, // ✅ Changed from 'address' to 'addresses'
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.phone = user.phone;
        token.addresses = user.addresses; // ✅ Changed from 'address' to 'addresses'
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as 'admin' | 'staff' | 'user';
        session.user.phone = token.phone as string;
        session.user.addresses = token.addresses as Array<{
          id: string;
          label: string;
          recipientName: string;
          phoneNumber: string;
          fullAddress: string;
          district: string;
          city: string;
          province: string;
          postalCode: string;
          notes?: string;
          isDefault: boolean;
          latitude?: number;
          longitude?: number;
        }>;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

export default NextAuth(authOptions);
