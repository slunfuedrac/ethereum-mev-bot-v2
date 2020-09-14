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
