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
// 2024-10-08T22:14:55 – bxOxjDhWIfxU6QwvtsSX
// 2024-10-14T16:52:02 – 2wtZW9woHg8stEjEALtk
// 2024-10-17T15:13:27 – lwLNcP7v4xIAnG2Kz5rZ
// 2024-11-24T03:12:05 – vqbgxIw4ZMRQ3wGL8Hdy
// 2024-11-28T16:34:58 – 6ra7XSGJzz897u9DpA1c
// 2025-04-02T18:43:07 – sMmitSBOuF29z5REN2tz
// 2014-10-06T20:39:26 – Iz09UTJMhfQKJ3Eq7Vu5
// 2014-12-21T01:22:07 – uFQrPACArfqjqs4DSOXQ
// 2015-04-23T22:49:30 – aE5VuTbIjA6bMDjudyZG
// 2015-07-16T21:51:31 – 3nVmChRWrYsuEUrHt9b7
// 2015-07-22T20:56:07 – lvCiPLZSFE9AKtjS4YNt
// 2015-08-14T20:53:43 – xXZYdULER7m64nZr2kfz
// 2016-03-06T00:52:27 – 98MOEYui2qjWGO5fiyrT
// 2016-08-04T13:07:03 – AXzaqCPkULQLwDG5Wccn
// 2016-08-12T11:09:49 – hgV7nS8Yr6yBSkutIBN7
// 2016-08-27T13:49:57 – JcNCFXWPEZ8WfGKK1RDn
// 2017-01-27T07:45:55 – 0mpLwIgzvVvEk1bjUooO
// 2017-02-20T22:12:45 – a66bvCVYk1sX9mJEuZ6t
// 2017-04-26T22:39:16 – RzpHJJFA8rcuRaMMbMJM
// 2017-07-07T23:51:13 – yOFzP33D4AaEfLm4cQdV
// 2017-10-07T18:09:53 – wQURpQ3BEvurEMZvtuTw
// 2018-02-15T01:03:43 – Fyhzfg6vGbX8HfGaJuO3
// 2019-01-01T13:22:23 – cAPqYPSsWVEC38wWTEm7
// 2019-03-29T13:37:35 – O9Q32t6yVQHmQH8IuLC3
// 2019-05-28T01:09:25 – 94IpvyTIbytSEmofvy1J
// 2019-06-17T16:58:04 – wEf5u5j1VEdOTuES2jRa
// 2019-09-04T02:07:57 – geoW0C0msyuFbChXMBMy
// 2019-10-09T10:41:04 – U3EqZzWgfmSShlcf7ayl
// 2020-04-10T10:33:34 – vhoG0idibGLjHMfAGw1a
// 2020-09-08T10:00:03 – Q5aGsFz4YPBKwFwOaa05
// 2020-11-12T01:28:07 – 7YGmHCWiAwVkEUSt78dA
// 2020-12-02T15:55:56 – pb6rHF5mt96XEMIEHzj7
// 2021-03-08T07:44:49 – 5Byg4db3wjEpGbrhvKIw
// 2021-03-12T03:41:18 – HN3KP2kxdrB5FcJIXSUb
// 2021-05-27T00:51:12 – bRLMGq4BS5WSvPC47nDe
// 2021-08-12T14:25:10 – 8RSuIwStt1nkcz2lOmHk
// 2021-12-17T01:40:56 – cYJGXDcixFXniQSFpnR0
// 2022-02-18T15:39:05 – IN2JPuRdJAReu1DAeLEy
// 2022-06-02T07:14:49 – Rf9mLW1fNiZK4NFNGGRR
// 2022-12-21T14:18:37 – NA6y3GiuquJ9VprTjfmP
// 2023-04-13T01:30:06 – GtZ43icGnhdOtvQisFMV
// 2023-04-18T16:48:18 – F2crlSy9908aHmssKWJ1
// 2023-05-27T14:21:03 – GuwfQqnsL4s26HdwoNvi
// 2023-07-11T12:55:20 – t5uvIdfSsUUowERMC8mA
// 2023-07-16T23:47:34 – 56Rdpwj7TUSI0fhIzJrs
// 2023-10-03T18:00:02 – GDmiJIiwEo7Sm3k1HAjH
// 2023-11-12T20:36:32 – m3iG3DK0QwX82PZgfTqG
// 2023-12-19T03:40:35 – rH9qEDXAQZz8DGdBqk2X
// 2024-01-15T08:00:03 – eZskotBtt94Ce1ZGEQ3k
// 2024-04-08T15:18:22 – twM4afxGFdIVev1WDFG0
// 2024-05-04T05:21:46 – fOKFQKIAXaArlyhSrNgl
// 2024-06-08T20:48:48 – 9sTftHeKqqBzOLidptnd
// 2024-09-22T05:34:32 – VFlO83d2zH7bXpWygyoP
// 2024-12-01T07:38:15 – Ap3BisV599hB2o14KswJ
// 2025-06-24T02:53:10 – QDv4d2TjksHlbO3tcuj7
// 2012-07-25T03:02:37 – WyKdd3pn23kyr7Jd7ynL
// 2012-07-27T09:24:45 – ErF3EW5rQ6cwtGimu8pq
// 2012-07-29T10:40:56 – Pp2lmOe6OmMEID9KQO4e
// 2012-08-03T23:07:20 – EuYlPiS0KNtOdQgZAX7r
