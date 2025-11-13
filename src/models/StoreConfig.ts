import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreConfig extends Document {
  storeName: string;
  storeCity: string;
  storeCityId: string; // RajaOngkir city ID (e.g., "309" for Makassar)
  storeProvince: string;
  storeProvinceId: string;
  storeAddress: {
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
  };
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  shippingSettings: {
    rajaOngkirPlan: 'free' | 'all';
    maxWeight: number; // Maximum weight per order (grams)
    processingTime: string; // e.g., "1-2 hari kerja"
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const StoreConfigSchema = new Schema<IStoreConfig>(
  {
    storeName: { type: String, required: true },
    storeCity: { type: String, required: true },
    storeCityId: { type: String, required: true }, // For RajaOngkir origin
    storeProvince: { type: String, required: true },
    storeProvinceId: { type: String, required: true },
    storeAddress: {
      street: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp: { type: String, required: true },
    },
    businessHours: {
      weekdays: { type: String, required: true },
      saturday: { type: String, required: true },
      sunday: { type: String, required: true },
    },
    shippingSettings: {
      rajaOngkirPlan: { 
        type: String, 
        enum: ['free', 'all'], 
        default: 'free' 
      },
      maxWeight: { type: Number, default: 30000 }, // 30kg default
      processingTime: { type: String, default: '1-2 hari kerja' },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster queries
StoreConfigSchema.index({ isActive: 1 });

const StoreConfig = 
  mongoose.models.StoreConfig || 
  mongoose.model<IStoreConfig>('StoreConfig', StoreConfigSchema, 'store_configs');

export default StoreConfig;
