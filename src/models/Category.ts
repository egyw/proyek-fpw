import mongoose, { Schema, Document, Model } from 'mongoose';

// Unit option interface
export interface IUnitOption {
  value: string;      // e.g., "sak", "kg", "batang"
  label: string;      // e.g., "Sak (50kg)", "Kilogram (kg)"
  conversionRate: number;  // Conversion to base unit (e.g., 50 for sak to kg)
}

// Plain object interface (for tRPC/API responses)
export interface ICategoryData {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
  productCount: number;
  order: number;
  availableUnits: IUnitOption[];  // Units available for products in this category
  createdAt: Date;
  updatedAt: Date;
}

// Document interface (extends Mongoose Document)
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
  productCount: number;
  order: number;
  availableUnits: IUnitOption[];  // Units available for products in this category
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori harus diisi'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug harus diisi'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi harus diisi'],
      trim: true,
    },
    icon: {
      type: String,
      default: '', // Lucide icon name (e.g., "Package", "Wrench")
    },
    image: {
      type: String,
      default: '/images/dummy_image.jpg',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    productCount: {
      type: Number,
      default: 0,
      min: [0, 'Jumlah produk tidak boleh negatif'],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Urutan tidak boleh negatif'],
    },
    availableUnits: [{
      value: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      conversionRate: {
        type: Number,
        required: true,
        min: [0.001, 'Conversion rate harus positif'],
      },
    }],
  },
  {
    timestamps: true, // Auto create createdAt & updatedAt
  }
);

// Indexes untuk performa query
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });

// Export Model
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema, 'categories');

export default Category;
