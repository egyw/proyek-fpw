import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    addresses: Array<{
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
      addresses: Array<{
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
    addresses: Array<{
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
    isActive: boolean;
  }
}
