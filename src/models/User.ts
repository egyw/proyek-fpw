import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface untuk TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'user';
  fullName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
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
    address: {
      street: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      province: {
        type: String,
        default: '',
      },
      postalCode: {
        type: String,
        default: '',
        match: [/^[0-9]{5}$|^$/, 'Kode pos harus 5 digit'],
      },
    },
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
