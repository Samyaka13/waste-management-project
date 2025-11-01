import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";

export const verifyJWT = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { _id?: string };

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // assign to req.user — cast to any to avoid augmenting Express types here
    (req as any).user = user;
    next();
  } catch (error) {
    throw new ApiError(401, (error as Error)?.message || "Invalid access token");
  }
});