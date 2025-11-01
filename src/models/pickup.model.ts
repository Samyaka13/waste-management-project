import mongoose, { Schema, Document } from 'mongoose';

export interface IPickup extends Document {
  bin: mongoose.Types.ObjectId;
  wastePicker: mongoose.Types.ObjectId;
  status: 'REQUESTED' | 'COMPLETED' | 'CANCELLED';
  requestedAt: Date;
  completedAt?: Date;
}

const pickupSchema = new Schema<IPickup>(
  {
    bin: {
      type: Schema.Types.ObjectId,
      ref: 'Bin',
      required: true,
    },
    wastePicker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Pickup = mongoose.model<IPickup>('Pickup', pickupSchema);