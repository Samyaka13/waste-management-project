import mongoose, { Schema, Document } from 'mongoose';

// Interface for TypeScript
export interface IWasteEntry extends Document {
  user: mongoose.Types.ObjectId;
  wasteType: 'ORGANIC' | 'RECYCLABLE' | 'HAZARDOUS' | 'GENERAL';
  weight: number; // We can store the weight in grams
}

const wasteEntrySchema = new Schema<IWasteEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wasteType: {
      type: String,
      enum: ['ORGANIC', 'RECYCLABLE', 'HAZARDOUS', 'GENERAL'],
      required: [true, 'Waste type is required'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const WasteEntry = mongoose.model<IWasteEntry>(
  'WasteEntry',
  wasteEntrySchema
);