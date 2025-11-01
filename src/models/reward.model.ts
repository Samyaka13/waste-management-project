import mongoose, { Schema, Document } from 'mongoose';

// Interface defining the Reward document structure
export interface IReward extends Document {
  title: string;
  description: string;
  cost: number; // How many ecoCoins this reward costs
  type: 'DISCOUNT' | 'GIFT' | 'VOUCHER';
  stock: number; // How many of this reward are available (-1 for unlimited)
  imageUrl: string; // A URL for the reward's image
  isActive: boolean; // So admins can toggle rewards on/off
}

const rewardSchema = new Schema<IReward>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['DISCOUNT', 'GIFT', 'VOUCHER'],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: -1, // -1 signifies unlimited stock
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Rewards are active by default
    },
  },
  { timestamps: true }
);

export const Reward = mongoose.model<IReward>('Reward', rewardSchema);