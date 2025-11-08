import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: 'admin' | 'staff' | 'user';
      phone: string;
      isActive: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    isActive: boolean;
  }
}
