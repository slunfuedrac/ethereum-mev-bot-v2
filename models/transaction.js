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
// 2014-08-17T21:06:32 – t5hIp8sjwsEjGMSRDFZw
// 2014-12-23T15:54:49 – 0BanChW8Eu4jXEoFsXqr
// 2015-08-13T19:31:22 – w2ndMpAGCG2Q4u3dbBcR
// 2015-10-24T12:56:38 – 6y5QxfYGfk0FM2KcTQ2H
// 2016-08-24T15:52:44 – K3uSxrYM6i8syBY88zx0
// 2017-01-08T11:18:21 – lx84wIWkRufqilwedzMb
// 2017-03-20T00:44:13 – Bek2PI5WBA7SglUQ2Pz2
// 2017-09-15T08:56:51 – EpiuS2Ff2XYT50yhjv2y
// 2018-01-19T09:28:13 – U4NBHaxcrIClFoa32efW
// 2018-11-12T01:26:49 – 41ncK1QrQEVwGPgK3zPu
// 2021-02-05T06:58:45 – nCDUqvGNNIHwShICmFfo
// 2021-06-14T06:26:54 – 6QyQdavcjvTaDfJ3fQEu
// 2023-01-10T07:57:37 – AUWnRJ9OI6JaIeUpHq1w
// 2023-01-18T20:06:30 – ZvuRcmNufk6QlrINyTFA
// 2023-05-21T10:47:27 – AIOwwIkW218a2hUoW8tF
// 2024-06-23T06:41:53 – ElZWVlzc2E6rLe7c5jG7
