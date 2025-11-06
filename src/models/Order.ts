import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number; // Price at the time of purchase
  quantity: number;
  unit: string;
  category: string;
}

export interface IShippingAddress {
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderId: string; // Unique order number (e.g., "ORD-2025-001")
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  total: number;
  
  // Payment
  paymentMethod: string; // "midtrans", "cod", etc.
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  paidAt?: Date;
  
  // Midtrans specific
  snapToken?: string; // Midtrans Snap token
  snapRedirectUrl?: string; // Midtrans redirect URL
  transactionId?: string; // Midtrans transaction ID
  
  // Order status
  orderStatus: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  
  // Shipping info (filled by admin after shipping)
  shippingInfo?: {
    courier: string;
    trackingNumber: string;
    shippedDate: Date;
  };
  
  // Cancellation
  cancelReason?: string;
  cancelledAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  recipientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  fullAddress: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  notes: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    
    paymentMethod: { type: String, required: true },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'expired'],
      default: 'pending'
    },
    paidAt: { type: Date },
    
    snapToken: { type: String },
    snapRedirectUrl: { type: String },
    transactionId: { type: String },
    
    orderStatus: {
      type: String,
      enum: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
      default: 'pending_payment'
    },
    
    shippingInfo: {
      courier: { type: String },
      trackingNumber: { type: String },
      shippedDate: { type: Date },
    },
    
    cancelReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
