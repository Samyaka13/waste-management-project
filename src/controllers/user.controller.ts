import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/user.model.js';

// --- Register User Controller ---
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user details from request body
  const { username, email, fullName, password } = req.body;

  // 2. Validate: Check for empty fields
  if ([fullName, email, username, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  // 3. Check if user already exists (by username or email)
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, 'User with this email or username already exists');
  }

  // 4. Handle avatar image upload
  // 'req.file' is available thanks to your multer middleware
  const avatarLocalPath = req.file?.path;
  console.log(avatarLocalPath)
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }

  // 5. Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar.url)
  if (!avatar || !avatar.url) {
    throw new ApiError(500, 'Error while uploading avatar to Cloudinary');
  }

  // 6. Create new user in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url, // Store the Cloudinary URL
    email,
    password, // The 'pre-save' hook in your model will hash this
    username: username.toLowerCase(),
    role: 'USER', // Default role
  });

  // 7. Get the created user (without the password)
  const createdUser = await User.findById(user._id).select('-password');
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  // 8. Send success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User registered successfully'));
});
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get email/username and password from request body
  const { email, username, password } = req.body;

  // 2. Validate: Check for empty fields
  if (!(username || email)) {
    throw new ApiError(400, 'Username or email is required');
  }
  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  // 3. Find user in database (include password for validation)
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select('+password'); // Explicitly include password

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  // 4. Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  // 5. Generate Access and Refresh Tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 6. Save refresh token to user's document in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 7. Send tokens to user (cookie and response)
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  };

  // Get user data without password and refresh token
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully'
      )
    );
});

// --- NEW: Logout User Controller ---
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // The 'verifyJWT' middleware already added 'req.user'
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request');
  }

  // Find user and remove their refresh token
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined, // Remove it from the database
      },
    },
    {
      new: true,
    }
  );

  // Clear cookies from the browser
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export { registerUser, loginUser, logoutUser };