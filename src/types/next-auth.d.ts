import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
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
      address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
      };
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
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
    isActive: boolean;
  }
}
