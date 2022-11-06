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
// 2021-08-24T09:02:55 – NOu4gGpyPtR80h6Si0up
// 2021-09-15T03:13:58 – 0mnvAabLYovNcfj0mzGI
// 2022-02-10T08:04:53 – wcBUob7AIX2ktRcMBxTo
// 2022-10-13T19:00:50 – A0C5D0lM0SqiZYRUVb5Y
// 2022-11-06T01:34:20 – R4HJ4PEtb3gHtSh41fSc
