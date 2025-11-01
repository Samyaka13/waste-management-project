import mongoose, { Schema, Document } from 'mongoose';

// Interface for TypeScript
export interface IBin extends Document {
  owner: mongoose.Types.ObjectId;
  modelNumber: string; // A unique ID for the hardware
  status: 'ONLINE' | 'OFFLINE' | 'FULL';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  fillLevels: {
    recyclable: number; // Percentage 0-100
    organic: number;
    hazardous: number;
  };
  lastPing: Date;
}

const binSchema = new Schema<IBin>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One bin per user
    },
    modelNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'FULL'],
      default: 'ONLINE',
    },
    // GeoJSON for mapping
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    fillLevels: {
      recyclable: { type: Number, default: 0, min: 0, max: 100 },
      organic: { type: Number, default: 0, min: 0, max: 100 },
      hazardous: { type: Number, default: 0, min: 0, max: 100 },
    },
    lastPing: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add 2dsphere index for geospatial queries (finding nearby bins)
binSchema.index({ location: '2dsphere' });

export const Bin = mongoose.model<IBin>('Bin', binSchema);