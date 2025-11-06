import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface untuk Address
export interface IAddress {
  id: string;
  label: string; // e.g., "Rumah", "Kantor", "Gudang"
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  district: string; // Kecamatan
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
}

// Interface untuk TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'user';
  fullName: string;
  phone: string;
  addresses: IAddress[]; // Changed from single object to array
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Mongoose
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username harus diisi'],
      trim: true,
      minlength: [3, 'Username minimal 3 karakter'],
      maxlength: [30, 'Username maksimal 30 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      minlength: [8, 'Password minimal 8 karakter'],
    },
    role: {
      type: String,
      required: [true, 'Role harus diisi'],
      enum: {
        values: ['admin', 'staff', 'user'],
        message: '{VALUE} bukan role yang valid',
      },
      default: 'user',
    },
    fullName: {
      type: String,
      required: [true, 'Nama lengkap harus diisi'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Nomor telepon harus diisi'],
      match: [/^[0-9]{10,15}$/, 'Format nomor telepon tidak valid (10-15 digit)'],
    },
    addresses: [
      {
        id: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: [true, 'Label alamat harus diisi'],
          trim: true,
        },
        recipientName: {
          type: String,
          required: [true, 'Nama penerima harus diisi'],
          trim: true,
        },
        phoneNumber: {
          type: String,
          required: [true, 'Nomor telepon penerima harus diisi'],
          match: [/^[0-9]{10,15}$/, 'Format nomor telepon tidak valid (10-15 digit)'],
        },
        fullAddress: {
          type: String,
          required: [true, 'Alamat lengkap harus diisi'],
          trim: true,
        },
        district: {
          type: String,
          required: [true, 'Kecamatan harus diisi'],
          trim: true,
        },
        city: {
          type: String,
          required: [true, 'Kota harus diisi'],
          trim: true,
        },
        province: {
          type: String,
          required: [true, 'Provinsi harus diisi'],
          trim: true,
        },
        postalCode: {
          type: String,
          required: [true, 'Kode pos harus diisi'],
          match: [/^[0-9]{5}$/, 'Kode pos harus 5 digit'],
        },
        notes: {
          type: String,
          default: '',
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Auto create createdAt & updatedAt
  }
);

// Indexes untuk performa query dan unique constraints
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });

// Export Model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
