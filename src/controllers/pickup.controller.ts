import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Bin } from '../models/bin.model.js';
import { Pickup } from '../models/pickup.model.js';
import type { IUser } from '../models/user.model.js';

// --- (For Waste Picker) Find Nearby Full Bins ---
const findNearbyFullBins = asyncHandler(
  async (req: Request, res: Response) => {
    // Get location from query params (e.g., ?long=-73.96&lat=40.78)
    const { long, lat } = req.query;

    if (!long || !lat) {
      throw new ApiError(
        400,
        'Longitude (long) and latitude (lat) are required as query parameters'
      );
    }

    const longitude = parseFloat(long as string);
    const latitude = parseFloat(lat as string);

    // Use MongoDB's geospatial query to find bins
    const nearbyBins = await Bin.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude], // [long, lat]
          },
          distanceField: 'distance', // Adds a 'distance' field (in meters)
          maxDistance: 10000, // Find bins within a 10km radius
          query: {
            // Only find bins that are 'FULL' or 'ONLINE' (and not offline)
            status: { $in: ['FULL', 'ONLINE'] },
            // Filter to find bins where any fill level is high
            $or: [
              { 'fillLevels.recyclable': { $gte: 90 } },
              { 'fillLevels.organic': { $gte: 90 } },
              { 'fillLevels.hazardous': { $gte: 90 } },
            ],
          },
          spherical: true,
        },
      },
      {
        $project: {
          // Only return the data the waste picker needs
          _id: 1,
          modelNumber: 1,
          location: 1,
          fillLevels: 1,
          status: 1,
          distance: 1, // The distance from the waste picker
        },
      },
      {
        $sort: { distance: 1 }, // Sort by closest first
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          nearbyBins,
          'Nearby full bins fetched successfully'
        )
      );
  }
);

// --- (For Waste Picker) Request a Bin Pickup ---
const requestBinPickup = asyncHandler(async (req: Request, res: Response) => {
  const { binId } = req.body;
  const wastePickerId = (req as any).user?._id;

  if (!binId) {
    throw new ApiError(400, 'binId is required');
  }

  // Check if bin exists and is not already being picked up
  const bin = await Bin.findById(binId);
  if (!bin) {
    throw new ApiError(404, 'Bin not found');
  }

  // Check if bin is already part of an active pickup request
  const existingPickup = await Pickup.findOne({
    bin: binId,
    status: 'REQUESTED',
  });
  if (existingPickup) {
    throw new ApiError(409, 'This bin is already scheduled for pickup');
  }

  // Create the new pickup record
  const newPickup = await Pickup.create({
    bin: binId,
    wastePicker: wastePickerId,
    status: 'REQUESTED',
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newPickup, 'Pickup requested successfully')
    );
});

export { findNearbyFullBins, requestBinPickup };