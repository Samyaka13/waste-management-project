# 🤖 RoboSort: Intelligent Robotic Waste Sorting & Management Platform

This repository contains the complete backend server for the **RoboSort** project — a smart waste segregation and management system designed for the **Smart India Hackathon (SIH)**.

The backend is a robust **Node.js** application written in **TypeScript**, providing a scalable API to manage users, smart bins, waste data, and a full incentive-based economy.

---

## 🧩 1. The Problem

Based on the SIH 2025 challenge, the core issue is the **failure of at-source waste segregation** in urban areas, leading to:

- Inefficient recycling and overburdened landfills
- Systemic failures in municipal operations
- Low calorific value of mixed waste (unsuitable for energy generation)
- Hazardous conditions and exploitation for informal waste pickers

---

## 💡 2. The RoboSort Solution

**RoboSort** is an AI and IoT-driven platform that tackles this with a **closed-loop system**:

- **🗑️ Hardware (Smart Bin):** A smart bin (e.g., ESP32-based) uses a camera and sensors to classify waste automatically.
- **⚙️ Backend API (This Project):** The bin sends an image to this backend for AI classification.
- **💰 Data & Incentives:** The backend identifies the waste type, logs it, and rewards the user with _ecoCoins_.
- **📱 Mobile App:** A user-facing app consumes this API to show analytics, bin status, and a redeem shop.
- **🔄 Ecosystem:** Waste pickers are integrated into the system to manage pickups for full bins — creating a circular economy.

---

## 🚀 3. Core Features (Backend)

- **Secure Authentication:** JWT (Access & Refresh Tokens)
- **Role-Based Access Control:** Separate logic for USER, ADMIN, and WASTE_PICKER
- **AI Classification Endpoint:** For automatic waste type detection (mocked currently)
- **Incentive System:** ecoCoins awarded automatically for waste deposits
- **Waste Analytics:** Aggregated insights for user dashboards
- **Smart Bin IoT Integration:** Real-time bin data (fill levels, status, location)
- **Pickup Logistics:** Waste pickers can find and book full bins for collection
- **Reward Management:** Admin-only control over reward creation and redemption

---

## 🧰 4. Tech Stack

| Component              | Technology          |
| ---------------------- | ------------------- |
| **Runtime**            | Node.js             |
| **Framework**          | Express.js          |
| **Language**           | TypeScript          |
| **Database**           | MongoDB (Mongoose)  |
| **Authentication**     | JWT, bcrypt         |
| **File Uploads**       | Cloudinary + Multer |
| **Validation**         | Mongoose Validation |
| **Environment Config** | dotenv              |

---

## 📁 5. Project Structure

```bash
src/
├── controllers/       # Business logic (e.g., registerUser)
├── db/                # Database connection logic
├── middlewares/       # Custom middleware (e.g., verifyJWT, verifyRole)
├── models/            # Mongoose schemas (User, Bin, Waste, Pickup, Reward)
├── routes/            # API endpoint definitions
├── utils/             # Helper utilities (ApiError, ApiResponse, cloudinary)
├── app.ts             # Express app configuration
├── constants.ts       # Project constants (e.g., DB_NAME)
└── index.ts           # Server entry point (connects DB, starts server)

---

## ⚙️ 6. Getting Started

### **Prerequisites**

- Node.js (v18.x or higher)
- npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### **Installation & Setup**

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd backend

   ```

2. **Install dependencies**

`npm install`

3. **Create .env file**
   `PORT=5000`

# MongoDB

`MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net`

# JWT

```bash
ACCESS_TOKEN_SECRET=youraccesstokensecret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
REFRESH_TOKEN_EXPIRY=10d
```

# Cloudinary

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

# CORS

`CORS_ORIGIN=*`

4. **Run the development server**
   `npm run dev`

### Your server will be live at:

👉 http://localhost:5000

## 📡 7. API Endpoints Guide

| Method | Endpoint           | Protection | Description                                            |
| ------ | ------------------ | ---------- | ------------------------------------------------------ |
| POST   | `/register`        | Public     | Register a new user (multipart/form-data with avatar). |
| POST   | `/login`           | Public     | Log in user with email & password. Returns tokens.     |
| POST   | `/logout`          | User       | Logout by clearing refresh token.                      |
| GET    | `/me`              | User       | Get current user details.                              |
| POST   | `/change-password` | User       | Change password.                                       |
| PATCH  | `/update-details`  | User       | Update user details (name/email).                      |
| PATCH  | `/update-avatar`   | User       | Update avatar (multipart/form-data).                   |

## ♻️ Waste & Classification (`/api/v1/waste`)

| Method | Endpoint     | Protection | Description                                                |
| ------ | ------------ | ---------- | ---------------------------------------------------------- |
| POST   | `/classify`  | User       | [Hardware] Classify waste image, log data, award ecoCoins. |
| GET    | `/analytics` | User       | Aggregated analytics for dashboard (pie chart).            |
| GET    | `/history`   | User       | Paginated waste deposit history.                           |

## 🗑️ Smart Bin IoT (`/api/v1/bin`)

| Method | Endpoint                | Protection | Description                                           |
| ------ | ----------------------- | ---------- | ----------------------------------------------------- |
| GET    | `/my-bin`               | User       | Get user’s assigned smart bin details.                |
| PATCH  | `/update-status/:binId` | Hardware   | [Hardware] Update bin status (fill levels, location). |

## 🚚 Pickup Logistics (`/api/v1/pickup`)

| Method | Endpoint              | Protection   | Description                                     |
| ------ | --------------------- | ------------ | ----------------------------------------------- |
| GET    | `/find-full-bins`     | WASTE_PICKER | List full bins available for pickup.            |
| POST   | `/book/:binId`        | WASTE_PICKER | Book a pickup for a full bin.                   |
| PATCH  | `/complete/:pickupId` | WASTE_PICKER | Mark a pickup as completed (resets bin levels). |
| GET    | `/my-pickups`         | WASTE_PICKER | View pickups assigned to logged-in picker.      |

## 🎁 Rewards & Redemption (`/api/v1/rewards`)

| Method | Endpoint            | Protection | Description                         |
| ------ | ------------------- | ---------- | ----------------------------------- |
| POST   | `/create`           | ADMIN      | Create a new reward (e.g., coupon). |
| GET    | `/`                 | User       | Fetch all available rewards.        |
| POST   | `/redeem/:rewardId` | User       | Redeem a reward using ecoCoins.     |

## 🧠 8. Summary

RoboSort combines **AI**, **IoT**, and **gamified incentives** to build a smart and sustainable waste management ecosystem.  
By rewarding eco-friendly actions, it aims to make **at-source waste segregation efficient, transparent, and inclusive**.

---

## 🛠️ 9. Scripts

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Run the server in development mode (with tsx). |
| `npm run build` | Build TypeScript project for production.       |
| `npm start`     | Start compiled server.                         |
