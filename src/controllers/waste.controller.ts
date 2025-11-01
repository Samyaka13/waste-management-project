import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { WasteEntry } from '../models/waste.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// --- Log Waste from Smart Bin ---
const logWaste = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get data from request.
  // We assume the smart bin sends its own user ID and the waste details.
  // In a real app, the bin might have its own ID, but for this, let's
  // assume the logged-in user (`req.user`) is depositing the waste.
  const { wasteType, weight } = req.body;
  const userId = (req as any).user?._id;

  // 2. Validate data
  if (!userId) {
    throw new ApiError(401, 'Unauthorized request. No user found.');
  }
  if (!wasteType || !weight) {
    throw new ApiError(400, 'Waste type and weight are required');
  }
  if (weight <= 0) {
    throw new ApiError(400, 'Weight must be a positive number');
  }

  // 3. Define Eco Coin reward logic
  // (You can make this much more complex later)
  let coinsToAward = 0;
  switch (wasteType.toUpperCase()) {
    case 'RECYCLABLE':
      coinsToAward = Math.floor(weight * 0.5); // 0.5 coins per gram
      break;
    case 'ORGANIC':
      coinsToAward = Math.floor(weight * 0.2); // 0.2 coins per gram
      break;
    default:
      coinsToAward = 1; // 1 token just for using the bin
  }

  // Use a transaction to ensure both operations succeed or fail together
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 4. Create the new waste log entry
    const newWasteEntry = await WasteEntry.create(
      [
        {
          user: userId,
          wasteType: wasteType.toUpperCase(),
          weight: Number(weight),
        },
      ],
      { session }
    );

    // 5. Update the user's ecoCoins
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { ecoCoins: coinsToAward }, // Atomically increment the coin count
      },
      { session, new: true } // 'new: true' returns the updated document
    ).select('ecoCoins');

    if (!updatedUser) {
      throw new ApiError(404, 'User not found, could not award coins');
    }

    // 6. Commit the transaction
    await session.commitTransaction();

    // 7. Send success response
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          loggedWaste: newWasteEntry[0],
          newCoinBalance: updatedUser.ecoCoins,
        },
        'Waste logged and eco-coins awarded successfully'
      )
    );
  } catch (error) {
    // 8. Abort transaction on error
    await session.abortTransaction();
    throw new ApiError(
      500,
      (error as Error).message || 'Transaction failed, waste not logged'
    );
  } finally {
    // 9. End the session
    session.endSession();
  }
});

const getWasteAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request. No user found.');
  }

  // Use the MongoDB Aggregation Pipeline to get analytics
  const analytics = await WasteEntry.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId), // Match only the logged-in user
      },
    },
    {
      $group: {
        _id: '$wasteType', // Group by the wasteType field
        totalWeight: { $sum: '$weight' }, // Sum the weight for each group
        count: { $sum: 1 }, // Count the number of entries for each group
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id
        wasteType: '$_id', // Rename _id to wasteType
        totalWeight: 1,
        count: 1,
      },
    },
  ]);

  if (!analytics) {
    throw new ApiError(404, 'No analytics data found for this user');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        'Waste analytics fetched successfully'
      )
    );
});


// --- NEW: Get Waste History (Paginated) ---
const getWasteHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;

  // Get page and limit from query params, with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request. No user found.');
  }

  // Find all waste entries for the user, sort by newest, paginate
  const wasteHistory = await WasteEntry.find({ user: userId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip)
    .limit(limit);

  const totalEntries = await WasteEntry.countDocuments({ user: userId });
  const totalPages = Math.ceil(totalEntries / limit);

  const paginatedResult = {
    data: wasteHistory,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalEntries: totalEntries,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginatedResult,
        'Waste history fetched successfully'
      )
    );
});
export { logWaste,getWasteAnalytics,getWasteHistory };
