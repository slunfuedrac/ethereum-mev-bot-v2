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
// 2025-05-18T03:52:04 – SUEKeCcNrZ9jVMlbDqxz
// 2025-05-18T07:54:32 – VPKqwdnNY1MLc3FfdLRC
// 2020-07-10T02:28:11 – VufBYo9dDTXJ7ivn57sg
// 2020-07-16T12:58:34 – klEzHYUlqeY6gmqGIyYu
// 2020-11-18T12:59:59 – zIS5k5nIb6XtLnDswX0u
// 2021-03-01T11:02:59 – R5cYh8LM7MiRamCVjzB4
// 2021-04-02T06:51:34 – LNGbLK76t6YJngxknf3Y
// 2021-05-09T20:42:40 – 1kkwqNzTCrj0R428nAnA
// 2021-06-30T16:24:06 – gJzNBrLuaxZSy6MuJPKP
// 2021-07-01T08:38:59 – a1asHPP4bAjuzGa6PtCs
// 2021-07-23T06:50:34 – HCThTm1SUsYTOBq7zvpP
// 2021-08-24T21:32:20 – 8T4BQT0H3IW13V4BfE40
// 2021-09-28T09:56:11 – RRc999uGpuwMUfIRxQkn
// 2021-12-13T09:07:45 – TbX3jvxIaHR9k4ma4JuB
// 2022-04-23T07:09:10 – ytpF6Lq1hEPDmXm5vCbQ
// 2020-08-05T18:59:50 – iXtu0pEyIjTmo7d5YN0F
// 2020-09-15T23:28:48 – 7SVDknxraryk4aG74QV2
// 2020-10-14T07:16:30 – kC8PNKb2tB9qrcFwHZ9m
// 2020-10-27T15:31:23 – MFaPxU5k08SORPzZ4APr
// 2020-11-21T09:58:39 – h8YhqXlcHHKMO0NQ5zMh
// 2020-12-20T22:59:39 – NEKFFZQMRFJ6SRpnWlXj
// 2020-12-23T01:31:58 – GDwFB3eC9J4V42mUlALb
// 2021-02-21T00:04:03 – mHYEmjLgi9AzHuOciDeH
