import mongoose, { Schema, Document } from 'mongoose';

// Stock Movement Interface
export interface IStockMovement extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productCode: string;
  movementType: 'in' | 'out';
  quantity: number;
  unit: string;
  reason: string;
  referenceType: 'order' | 'adjustment' | 'initial' | 'return';
  referenceId: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  previousStock: number;
  newStock: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement Schema
const StockMovementSchema = new Schema<IStockMovement>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: ['in', 'out'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    unit: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['order', 'adjustment', 'initial', 'return'],
      required: true,
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
StockMovementSchema.index({ productId: 1, createdAt: -1 });
StockMovementSchema.index({ referenceId: 1 });
StockMovementSchema.index({ createdAt: -1 });

// Export model
export default mongoose.models.StockMovement || 
  mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
