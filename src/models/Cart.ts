import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  stock: number;
  category: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user - creates index automatically
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true, // Auto create createdAt & updatedAt
  }
);

// Note: userId index created automatically by unique: true
// No need for manual CartSchema.index({ userId: 1 })

const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema, 'carts');

export default Cart;
