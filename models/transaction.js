import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },

  chainId: {
    type: Number,
  },

  network: {
    type: String,
  },

  dex: {
    type: String,
    enum: ["1inch", "CowSwap"],
  },

  fromToken: {
    type: String,
  },

  toToken: {
    type: String,
  },

  fromAmount: {
    type: String,
  },

  toAmount: {
    type: String,
    default: "0",
  },

  txHash: {
    type: String,
    default: "",
  },

  error: {
    type: String,
    default: "",
  },

  gasFee: {
    type: String,
    enum: ["slow", "medium", "fast"],
    default: "medium",
  },

  slippage: {
    type: Number,
    default: 0.5,
  },
});

// Index for faster queries
TransactionSchema.index({ timestamp: -1 });
TransactionSchema.index({ chainId: 1, status: 1 });

export default mongoose.model("Transaction", TransactionSchema);
// ASHDLADXZCZC
// 2022-06-08T16:10:15 – nRaXd8Fm1Nj0giwkMnyV
// 2022-07-19T20:21:12 – heEVu1eRxeWeJEmpwBsW
// 2023-01-31T04:01:33 – EnOZlYxPLqcPPtmbXU3e
// 2023-09-21T06:18:30 – fcQ7DgL2bWiQW4kdcDGu
// 2023-09-27T13:48:02 – edwZORwdBCvOmH0Y4ZuM
// 2023-10-24T14:39:38 – eDAGo7wPz5hjnuvx9qxI
// 2024-02-18T23:08:31 – 5IxyDgpkotlmLahvcxan
// 2024-09-17T09:20:10 – V6vcAjZqMhFVW04kkgtQ
// 2025-03-12T08:08:10 – AKsbEZst9EN35BQXazwr
// 2025-06-09T07:48:31 – Gf5NFNigwCeJc5ppASwY
