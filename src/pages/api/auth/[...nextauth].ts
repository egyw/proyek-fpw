import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            existingUser.lastLogin = new Date();
            await existingUser.save();
            
            user.id = String(existingUser._id);
            user.username = existingUser.username;
            user.role = existingUser.role;
            user.phone = existingUser.phone || '';
            user.isActive = existingUser.isActive;
            
            return true;
          } else {
            const newUser = new User({
              fullName: user.name || 'User',
              email: user.email,
              username: user.email?.split('@')[0] || '',
              password: 'GOOGLE_OAUTH_NO_PASSWORD',
              role: 'user',
              phone: '0000000000',
              addresses: [],
              isActive: true,
              lastLogin: new Date(),
            });
            
            await newUser.save({ validateBeforeSave: false });
            
            user.id = String(newUser._id);
            user.username = newUser.username;
            user.role = newUser.role;
            user.phone = newUser.phone;
            user.isActive = newUser.isActive;
            
            return true;
          }
        } catch (error) {
          console.error('[Google OAuth] Error:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.phone = user.phone;
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
