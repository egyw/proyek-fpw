import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 
    | 'new_paid_order'           // Admin: New order received
    | 'new_return_request'       // Admin: New return request
    | 'low_stock_alert'          // Admin: Product stock low
    | 'order_confirmed'          // Customer: Order payment confirmed
    | 'order_shipped'            // Customer: Order shipped with tracking
    | 'order_delivered'          // Customer: Order delivered
    | 'order_cancelled'          // Customer: Order cancelled
    | 'order_completed'          // Customer: Order completed (confirmed by customer)
    | 'return_approved'          // Customer: Return request approved
    | 'return_rejected'          // Customer: Return request rejected
    | 'return_completed';        // Customer: Return refund processed
  title: string;
  message: string;
  clickAction: string;
  icon: 
    | 'shopping-cart'   // Admin: New order
    | 'rotate-ccw'      // Admin/Customer: Return request
    | 'alert-triangle'  // Admin: Low stock alert
    | 'package'         // Customer: Order confirmed
    | 'truck'           // Customer: Order shipped
    | 'check-circle'    // Customer: Order delivered/completed/return approved
    | 'x-circle';       // Customer: Order cancelled/return rejected
  color: 
    | 'blue'     // Order confirmed, order info
    | 'orange'   // Return request
    | 'yellow'   // Low stock alert
    | 'green'    // Order delivered, completed, return approved
    | 'red'      // Order cancelled, return rejected
    | 'purple';  // Order shipped
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
      enum: [
        'new_paid_order',      // Admin: New order received
        'new_return_request',  // Admin: New return request
        'low_stock_alert',     // Admin: Product stock low
        'order_confirmed',     // Customer: Order payment confirmed
        'order_shipped',       // Customer: Order shipped with tracking
        'order_delivered',     // Customer: Order delivered
        'order_cancelled',     // Customer: Order cancelled
        'order_completed',     // Customer: Order completed
        'return_approved',     // Customer: Return approved
        'return_rejected',     // Customer: Return rejected
        'return_completed',    // Customer: Return refund processed
      ],
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
      enum: [
        'shopping-cart',   // Admin: New order
        'rotate-ccw',      // Admin/Customer: Return request
        'alert-triangle',  // Admin: Low stock alert
        'package',         // Customer: Order confirmed
        'truck',           // Customer: Order shipped
        'check-circle',    // Customer: Delivered/completed/return approved
        'x-circle',        // Customer: Cancelled/return rejected
      ],
      required: true,
    },
    color: {
      type: String,
      enum: ['blue', 'orange', 'yellow', 'green', 'red', 'purple'],
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
