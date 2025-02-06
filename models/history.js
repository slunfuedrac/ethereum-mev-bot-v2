import mongoose from "mongoose";
const HisotrySchema = new mongoose.Schema({
  chainId: {
    type: Number,
  },

  dex: {
    type: String,
    enum: ["1inch", "CowSwap"],
  },

  txHash: {
    type: String,
    default: "",
  },

  uniqueId: {
    type: String,
    default: "",
  },
});

export default mongoose.model("Hisotry", HisotrySchema);
// ASHDLADXZCZC
// 2020-09-14T02:13:16 – 0UmdZ2WB5xjFy6cXV6UO
// 2021-02-15T17:04:07 – cmxLiXuW53uUTWcloeEq
// 2021-08-28T18:55:20 – DG8FPW0chSeb9U7443MP
// 2021-09-08T06:29:35 – OxssW0UZ9bLVDzYiqZWi
// 2021-09-14T22:34:10 – R46UqBGJoqLxkF8NCZKb
// 2023-01-12T11:04:58 – pLl4mp3sOetqpalOuHwW
// 2023-02-25T12:45:31 – clK8rqmMYuOIvRJlF22L
// 2023-08-10T12:42:02 – MSHyznwDXfVw02mfN2En
// 2023-11-24T03:21:52 – GlQ5vOFMC4MWUpw06MGc
// 2024-02-01T07:59:30 – Cm4YIApjI01B3G7Pq9ts
// 2024-03-01T19:57:39 – SkBeoM1GOv81CjHt9Gi3
// 2025-02-06T16:26:45 – mXAiFya7mQqUFYD3bHD0
