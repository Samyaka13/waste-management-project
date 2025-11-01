import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Bin } from '../models/bin.model.js';
import { User } from '../models/user.model.js';

// --- (For User) Get My Bin Details ---
const getMyBinDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;

    const bin = await Bin.findOne({ owner: userId });

    if (!bin) {
        throw new ApiError(404, 'No smart bin is registered for this user');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, bin, 'Bin details fetched successfully'));
});

// --- (For Hardware) Update Bin Status ---
// This endpoint will be called by your smart bin hardware
const updateBinStatus = asyncHandler(async (req: Request, res: Response) => {
    // We'll use the Bin's unique model number for authentication
    const { modelNumber, fillLevels, status } = req.body;

    if (!modelNumber || !fillLevels) {
        throw new ApiError(400, 'Model number and fill levels are required');
    }

    // Find the bin by its unique hardware ID
    const bin = await Bin.findOneAndUpdate(
        { modelNumber },
        {
            $set: {
                fillLevels: {
                    recyclable: fillLevels.recyclable,
                    organic: fillLevels.organic,
                    hazardous: fillLevels.hazardous,
                },
                status: status || 'ONLINE', // Update status (e.g., 'FULL')
                lastPing: new Date(),
            },
        },
        { new: true } // Return the updated document
    );

    if (!bin) {
        throw new ApiError(404, 'Bin hardware not found');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { status: 'updated', lastPing: bin.lastPing },
                'Bin status updated successfully'
            )
        );
});

export { getMyBinDetails, updateBinStatus };