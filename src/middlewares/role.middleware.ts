import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { IUser } from '../models/user.model.js'; // Import your IUser interface

// This middleware takes an array of roles that are allowed to access the route
export const verifyRole = (allowedRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // We assume verifyJWT has already run and attached the user to req.user
    const user = (req as any).user as IUser;

    if (!user) {
      throw new ApiError(401, 'Unauthorized request. No user found.');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ApiError(
        403,
        `Forbidden. User role (${user.role}) is not authorized for this resource.`
      );
    }

    // If the user's role is in the allowedRoles array, proceed
    next();
  });
};