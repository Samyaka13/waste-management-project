import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET
) {
  throw new Error(
    'JWT secrets (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET) are not defined in .env'
  );
}

// --- TypeScript Interface ---
// This defines the structure of the User document for TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  avatar: string; // This will be a URL from Cloudinary
  password: string;
  role: 'USER' | 'ADMIN' | 'WASTE_PICKER'; // <-- PROJECT SPECIFIC CHANGE
  ecoCoins: number; // <-- PROJECT SPECIFIC CHANGE
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// --- Mongoose Schema ---
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true, // <-- Fixed typo (was 'trime')
      lowercase: true,
      index: true, // Added for faster searching
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: [true, 'Avatar is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Good! This hides the password from default queries
    },
    // --- PROJECT SPECIFIC CHANGE ---
    // Updated roles to match your project's user types
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'WASTE_PICKER'],
      default: 'USER', // Default user is a citizen/app user
    },
    // --- PROJECT SPECIFIC CHANGE ---
    // Added ecoCoins field from your SIH presentation
    ecoCoins: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false, // Also hide the refresh token from queries
    },
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Hooks (Middleware) ---
// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// --- Mongoose Methods ---
// Custom method to check password
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Check for the *specific* env variables you are using
if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET
) {
  throw new Error(
    'ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables'
  );
}

// Custom method to generate JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      role: this.role, // <-- Added role to token
    },
    process.env.ACCESS_TOKEN_SECRET!, // Added '!' to satisfy TypeScript
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d', // Added fallback
    }
  );
};

// Custom method to generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!, // Added '!' to satisfy TypeScript
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d', // Added fallback
    }
  );
};

export const User = mongoose.model<IUser>('User', userSchema);