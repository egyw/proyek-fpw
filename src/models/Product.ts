import mongoose, { Schema, Document, Model } from 'mongoose';

// Plain object interface (for tRPC/API responses)
export interface IProductData {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
  stock: number;
  minStock: number;
  availableUnits: string[];
  images: string[];
  description: string;
  rating: {
    average: number;
    count: number;
  };
  sold: number;
  views: number;
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured: boolean;
}

// Mongoose Document interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
  stock: number;
  minStock: number;
  availableUnits: string[];
  images: string[];
  description: string;
  rating: {
    average: number;
    count: number;
  };
  sold: number;
  views: number;
  attributes: Record<string, unknown>;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Mongoose
const ProductSchema = new Schema<IProduct>(
  {
    name: { 
      type: String, 
      required: [true, 'Nama produk harus diisi'],
      trim: true,
    },
    slug: { 
      type: String, 
      required: [true, 'Slug harus diisi'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: { 
      type: String, 
      required: [true, 'Kategori harus diisi'],
      enum: {
        values: ['Pipa', 'Besi', 'Semen', 'Triplek', 'Tangki Air', 'Kawat', 'Paku', 'Baut', 'Aspal'],
        message: '{VALUE} bukan kategori yang valid'
      }
    },
    brand: { 
      type: String, 
      required: [true, 'Brand harus diisi'],
      trim: true,
    },
    unit: { 
      type: String, 
      required: [true, 'Unit harus diisi'],
      lowercase: true,
    },
    price: { 
      type: Number, 
      required: [true, 'Harga harus diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    discount: {
      percentage: { 
        type: Number, 
        min: [0, 'Diskon tidak boleh negatif'],
        max: [100, 'Diskon maksimal 100%'],
        default: 0,
      },
      validUntil: { 
        type: String, 
        default: '',
      },
    },
    stock: { 
      type: Number, 
      required: [true, 'Stok harus diisi'],
      min: [0, 'Stok tidak boleh negatif'],
    },
    minStock: { 
      type: Number, 
      required: [true, 'Minimum stok harus diisi'],
      min: [0, 'Minimum stok tidak boleh negatif'],
    },
    availableUnits: [{ 
      type: String,
      lowercase: true,
    }],
    images: [{ 
      type: String,
    }],
    description: { 
      type: String, 
      required: [true, 'Deskripsi harus diisi'],
    },
    rating: {
      average: { 
        type: Number, 
        default: 0, 
        min: [0, 'Rating minimal 0'],
        max: [5, 'Rating maksimal 5'],
      },
      count: { 
        type: Number, 
        default: 0, 
        min: [0, 'Jumlah rating tidak boleh negatif'],
      },
    },
    sold: { 
      type: Number, 
      default: 0, 
      min: [0, 'Jumlah terjual tidak boleh negatif'],
    },
    views: { 
      type: Number, 
      default: 0, 
      min: [0, 'Jumlah view tidak boleh negatif'],
    },
    attributes: { 
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: { 
      type: Boolean, 
      default: true,
    },
    isFeatured: { 
      type: Boolean, 
      default: false,
    },
  },
  {
    timestamps: true, // Auto create createdAt & updatedAt
  }
);

// Indexes untuk performa query
// Note: slug already has unique index from schema definition (unique: true)
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Text search

// Export Model
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
