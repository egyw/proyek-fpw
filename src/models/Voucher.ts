import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const VoucherSchema = new Schema<IVoucher>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchase: {
    type: Number,
    required: true,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    min: 0,
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1,
  },
  usedCount: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: String,
    required: true,
  },
});

// Index for faster queries
VoucherSchema.index({ code: 1 });
VoucherSchema.index({ isActive: 1 });
VoucherSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', VoucherSchema);
