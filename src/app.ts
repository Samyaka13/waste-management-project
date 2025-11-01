import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


//importing routes here 
import userRouter from './routes/user.routes.js';
import wasteRouter from './routes/waste.routes.js';
import binRouter from './routes/bin.routes.js';
import pickupRouter from './routes/pickup.routes.js';
import rewardRouter from './routes/reward.routes.js';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/waste', wasteRouter);
app.use('/api/v1/bin', binRouter);
app.use('/api/v1/pickup', pickupRouter);
app.use('/api/v1/rewards', rewardRouter);
export default app;