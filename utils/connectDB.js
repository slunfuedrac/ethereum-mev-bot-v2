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
// 2023-04-25T00:59:00 – uFW8i9dyJLmLWWl1RIPy
// 2023-07-25T07:33:00 – r57YRkX76Vj9WsU3kRvQ
// 2023-08-21T05:10:16 – BhcmmSxLeVw7Ghd19wyS
// 2023-10-22T03:05:25 – nendRTBdXueA9BMhjesi
// 2024-09-11T10:13:24 – VLKQEPE7bb2V6wuwRUaR
// 2024-09-16T19:53:11 – 93UatFlzjha7HUjmlc0s
// 2024-09-24T03:18:50 – dG9Colho0ub6qatvHKlY
// 2024-10-16T14:54:03 – 8w8RtUvGuJfZtJ5xHuHX
// 2024-12-03T01:06:51 – nMUoUQ73I6sYWnOe6oqO
// 2025-02-14T00:07:27 – MSEzfZTVPr4qcgmiMiNU
