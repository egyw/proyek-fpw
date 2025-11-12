import mongoose, { Document, Schema } from 'mongoose';

export interface IReturnItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  reason: string;
  condition: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other';
}

export interface IReturn extends Document {
  returnNumber: string;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IReturnItem[];
  totalAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  completedDate?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ReturnItemSchema = new Schema<IReturnItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['damaged', 'defective', 'wrong_item', 'not_as_described', 'other'],
    required: true,
  },
});

const ReturnSchema = new Schema<IReturn>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: [ReturnItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    requestDate: {
      type: String,
      required: true,
    },
    approvedDate: String,
    rejectedDate: String,
    completedDate: String,
    rejectionReason: String,
    notes: String,
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes for better query performance
ReturnSchema.index({ returnNumber: 1 });
ReturnSchema.index({ orderId: 1 });
ReturnSchema.index({ customerId: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ requestDate: 1 });

const Return = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);

export default Return;
