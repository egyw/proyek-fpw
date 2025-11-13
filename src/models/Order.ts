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
  
  // Payment (auto-update via Midtrans webhook)
  paymentMethod: string; // "midtrans", "cod", etc.
  paymentType?: string; // Specific payment type from Midtrans (e.g., "gopay", "bank_transfer", "qris", "echannel", "credit_card", "alfamart", "shopeepay")
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  paymentExpiredAt?: Date; // Payment deadline (30 minutes from order creation)
  paidAt?: Date;
  
  // Midtrans specific
  snapToken?: string; // Midtrans Snap token
  snapRedirectUrl?: string; // Midtrans redirect URL
  transactionId?: string; // Midtrans transaction ID
  
  // Order status (manual update by admin)
  orderStatus: 'awaiting_payment' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
  
  // Return status (tracks return process)
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  
  // Shipping info (filled by admin after shipping)
  shippingInfo?: {
    courier: string; // Courier code (e.g., "jne", "jnt")
    courierName: string; // Courier display name (e.g., "JNE", "J&T Express")
    service: string; // Service type (e.g., "REG", "YES")
    trackingNumber: string;
    shippedDate: Date;
  };
  
  // Delivery confirmation (filled by admin)
  deliveredDate?: Date;
  
  // Rating & Review (filled by user after delivery)
  rating?: {
    score: number; // 1-5 stars
    review?: string; // Optional review text
    createdAt: Date;
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
    orderId: { type: String, required: true, unique: true }, // unique: true creates index
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    
    paymentMethod: { type: String, required: true },
    paymentType: { type: String }, // Specific payment type from Midtrans
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'expired', 'cancelled'],
      default: 'pending'
    },
    paymentExpiredAt: { type: Date },
    paidAt: { type: Date },
    
    snapToken: { type: String },
    snapRedirectUrl: { type: String },
    transactionId: { type: String },
    
    orderStatus: {
      type: String,
      enum: ['awaiting_payment', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'],
      default: 'awaiting_payment'
    },
    
    returnStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
      default: 'none'
    },
    
    shippingInfo: {
      courier: { type: String },
      courierName: { type: String },
      service: { type: String },
      trackingNumber: { type: String },
      shippedDate: { type: Date },
    },
    
    deliveredDate: { type: Date },
    
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String },
      createdAt: { type: Date },
    },
    
    cancelReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster queries
// Note: orderId already has index from unique: true, no need for manual index
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ returnStatus: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema, 'orders');
