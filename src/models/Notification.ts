import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'new_paid_order' | 'new_return_request' | 'low_stock_alert';
  title: string;
  message: string;
  clickAction: string;
  icon: 'shopping-cart' | 'rotate-ccw' | 'alert-triangle';
  color: 'blue' | 'orange' | 'yellow';
  isRead: boolean;
  data?: {
    orderId?: string;
    returnId?: string;
    productId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_paid_order', 'new_return_request', 'low_stock_alert'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    clickAction: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      enum: ['shopping-cart', 'rotate-ccw', 'alert-triangle'],
      required: true,
    },
    color: {
      type: String,
      enum: ['blue', 'orange', 'yellow'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
