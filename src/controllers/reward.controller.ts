import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Reward } from '../models/reward.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// --- (Admin) Create a new Reward ---
const createReward = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, cost, type, stock, imageUrl } = req.body;

  // 1. Validate input
  if (!title || !description || !cost || !type || !imageUrl) {
    throw new ApiError(400, 'All fields are required');
  }

  const costNum = Number(cost);
  const stockNum = stock ? Number(stock) : -1; // Default to -1 (unlimited)

  if (isNaN(costNum) || costNum < 0) {
    throw new ApiError(400, 'Cost must be a positive number');
  }

  // 2. Create reward in database
  const newReward = await Reward.create({
    title,
    description,
    cost: costNum,
    type,
    stock: stockNum,
    imageUrl,
    isActive: true, // Active by default
  });

  // 3. Send success response
  return res
    .status(201)
    .json(new ApiResponse(201, newReward, 'Reward created successfully'));
});

// --- (User) Get all active rewards ---
const listActiveRewards = asyncHandler(async (req: Request, res: Response) => {
  const rewards = await Reward.find({ isActive: true }).select(
    '-isActive -__v -createdAt -updatedAt' // Exclude fields users don't need
  );

  return res
    .status(200)
    .json(new ApiResponse(200, rewards, 'Active rewards fetched successfully'));
});

// --- (User) Redeem a Reward ---
const redeemReward = asyncHandler(async (req: Request, res: Response) => {
  const { rewardId } = req.params; // Get rewardId from URL (e.g., /redeem/:rewardId)
  const userId = (req as any).user?._id;

  if (!rewardId) return false
  if (!mongoose.Types.ObjectId.isValid(rewardId)) {
    throw new ApiError(400, 'Invalid reward ID');
  }

  // 1. Find the reward and user simultaneously
  const reward = await Reward.findById(rewardId);
  const user = await User.findById(userId);

  // 2. Validate user and reward
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (!reward) {
    throw new ApiError(404, 'Reward not found');
  }
  if (!reward.isActive) {
    throw new ApiError(400, 'This reward is no longer active');
  }

  // 3. Check stock
  if (reward.stock !== -1 && reward.stock <= 0) {
    throw new ApiError(400, 'This reward is out of stock');
  }

  // 4. Check if user has enough ecoCoins
  if (user.ecoCoins < reward.cost) {
    throw new ApiError(400, 'You do not have enough ecoCoins to redeem this');
  }

  // 5. Perform the transaction
  // Note: For a high-scale app, you'd use a MongoDB Transaction here
  // to ensure both operations succeed or fail together.
  try {
    // Subtract coins from user
    user.ecoCoins -= reward.cost;

    // Decrement stock (if not unlimited)
    if (reward.stock !== -1) {
      reward.stock -= 1;
    }

    // Save both documents
    await user.save({ validateBeforeSave: false });
    await reward.save({ validateBeforeSave: false });

    // 6. Send success response
    return res.status(200).json(
      new ApiResponse(
        200,
        { newEcoCoinBalance: user.ecoCoins, rewardRedeemed: reward.title },
        'Reward redeemed successfully'
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      'Error during transaction. Please try again.',
      error as any
    );
  }
});

export { createReward, listActiveRewards, redeemReward };