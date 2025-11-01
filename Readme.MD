PORT=5000

# Your MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net

# JWT Secrets
ACCESS_TOKEN_SECRET=youraccesstokensecret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Origin
CORS_ORIGIN=*
```


Run the development server:
This command uses tsx to watch for file changes and restart the server automatically.

npm run dev


Your server should now be running at http://localhost:5000.

7. API Endpoints Guide

Here is a complete list of all API endpoints available in the RoboSort backend.

👤 User & Authentication (/api/v1/users)

Method

Endpoint

Protection

Description

POST

/register

Public

Registers a new user. Expects multipart/form-data with fields: username, email, fullName, password, and avatar (file).

POST

/login

Public

Logs in a user. Expects JSON: { "email": "...", "password": "..." }. Returns accessToken and refreshToken.

POST

/logout

Protected (User)

Logs out the user by clearing the refreshToken from cookies.

GET

/me

Protected (User)

Gets the details of the currently logged-in user (for the app dashboard).

POST

/change-password

Protected (User)

Changes the user's password. Expects JSON: { "oldPassword": "...", "newPassword": "..." }.

PATCH

/update-details

Protected (User)

Updates user's fullName or email. Expects JSON: { "fullName": "...", "email": "..." }.

PATCH

/update-avatar

Protected (User)

Updates the user's avatar. Expects multipart/form-data with a single avatar (file).

♻️ Waste & Classification (/api/v1/waste)

Method

Endpoint

Protection

Description

POST

/classify

Protected (User)

[Hardware Endpoint] The main AI endpoint. Expects multipart/form-data with a single wasteImage (file). It classifies the image, logs the waste, and awards ecoCoins to the user.

GET

/analytics

Protected (User)

Gets aggregated waste analytics (total weight by type) for the logged-in user. Used for the dashboard pie chart.

GET

/history

Protected (User)

Gets a paginated history of the user's waste deposits.

🗑️ Smart Bin IoT (/api/v1/bin)

Method

Endpoint

Protection

Description

GET

/my-bin

Protected (User)

Gets the details and status (fill levels, location) of the user's assigned smart bin.

PATCH

/update-status/:binId

Protected (Hardware)

[Hardware Endpoint] Used by the smart bin (ESP32) to send its status. Expects JSON: { "fillLevels": { "organic": %, "recyclable": %, "other": % } }.

🚚 Pickup Logistics (/api/v1/pickup)

Method

Endpoint

Protection

Description

GET

/find-full-bins

Protected (WASTE_PICKER)

Returns a list of all bins that are marked as full (isFull: true) and not already booked (status: 'PENDING').

POST

/book/:binId

Protected (WASTE_PICKER)

Allows a waste picker to book a pickup for a specific full bin. Changes the bin and pickup status to SCHEDULED.

PATCH

/complete/:pickupId

Protected (WASTE_PICKICKE)

Marks a booked pickup as COMPLETED. This also resets the bin's fill levels to 0.

GET

/my-pickups

Protected (WASTE_PICKER)

Gets a list of all pickups (pending or completed) assigned to the currently logged-in waste picker.

🎁 Rewards & Redemption (/api/v1/rewards)

Method

Endpoint

Protection

Description

POST

/create

Protected (ADMIN)

Creates a new reward (e.g., "Coupon"). Expects JSON: { "title": "...", "description": "...", "cost": 500, "itemType": "COUPON" }.

GET

/

Protected (User)

Gets a list of all available rewards for the "Redeem" shop page.

POST

/redeem/:rewardId

Protected (User)

Allows a user to redeem a reward. The backend checks if the user has enough ecoCoins, deducts the cost, and logs the transaction.