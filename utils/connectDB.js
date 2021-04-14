import mongoose from "mongoose";
import "dotenv/config";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);

    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

export default connectDB;

// ASHDLADXZCZC
// 2021-01-07T21:35:54 – MEFAwT54txKeJdEWxYit
// 2021-04-07T22:16:51 – L8whNk3ft1Ks7knJteTe
// 2021-04-14T04:17:35 – gcOgyINO8jaUTzZ2OKFE
