toastr.options = {
  closeButton: true,
  progressBar: false,
  positionClass: "toast-top-right",
  timeOut: "5000",
};

class TradingBot {
  constructor() {
    this.isActive = false;
    this.lastTradeTime = 0;
    this.currentPosition = "";
    this.stopLossPrice = 0;
    this.slippage = 1;
    this.initialAmount = 0;
    this.currentAmount = 0;
    this.selectedStablecoin = "";
    this.buffer = 0;
    this.cooldown = 5;
    this.gasPriority = "normal";
    this.isUSDMode = false;
  }

  /**
   * Validates if there's enough balance for the initial swap
   * @param {Object} config - Bot configuration object
   * @returns {boolean} - Whether there's enough balance
   */
  async validateBalance(config) {
    try {
      const isUSDMode = config.isUSDMode || false;
      const initialAmount = parseFloat(config.initialAmount);
      const selectedStablecoin = config.stablecoin;

      if (!window.currentBalances) {
        console.error("Cannot validate balance: currentBalances not available");
        return false;
      }

      let requiredToken, availableBalance;

      if (isUSDMode) {
        requiredToken = selectedStablecoin;
        availableBalance =
          parseFloat(
            window.currentBalances[selectedStablecoin.toLowerCase()]
          ) || 0;
      } else {
        requiredToken = "WETH";
        availableBalance = parseFloat(window.currentBalances.weth) || 0;
      }

      console.log(
        `Validating balance: Need ${initialAmount} ${requiredToken}, Have ${availableBalance} ${requiredToken}`
      );

      if (availableBalance < initialAmount) {
        toastr.error(
          `Insufficient balance! You need at least ${initialAmount} ${requiredToken} but only have ${availableBalance.toFixed(
            6
          )} ${requiredToken}`
        );
        return false;
      }

      return true;
    } catch (error) {
      toastr.error("Failed to validate balance");
      return false;
    }
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  async start(config) {
    console.log("Starting bot with config:", config);

    const hasEnoughBalance = await this.validateBalance(config);
    if (!hasEnoughBalance) {
      console.log("Bot start canceled due to insufficient balance");
      return false;
    }

    this.isActive = true;
    this.stopLossPrice = parseFloat(config.stopLossPrice);
    this.slippage =
      config.slippage === "Auto" ? 0.5 : parseFloat(config.slippage);
    this.initialAmount = parseFloat(config.initialAmount);
    this.selectedStablecoin = config.stablecoin;
    this.buffer = config.buffer ? parseFloat(config.buffer) : 0;
    this.cooldown = config.cooldown ? parseInt(config.cooldown) : 5;
    this.gasPriority = config.gasPriority || "normal";
    this.isUSDMode = config.isUSDMode || false;
    this.currentPosition = config.isUSDMode ? "STABLE" : "WETH";

    this.toggleFormFields(false);

    const latestTx = await this.getLatestTransaction();
    if (latestTx) {
      this.currentAmount = parseFloat(latestTx.toAmount);

      console.log("Latest transaction:", latestTx);
      console.log("Current amount:", this.currentAmount);
      if (latestTx.toToken === this.selectedStablecoin) {
        this.currentPosition = "STABLE";
      } else if (latestTx.toToken === "WETH") {
        this.currentPosition = "WETH";
      } else {
        this.currentPosition = this.isUSDMode ? "STABLE" : "WETH";
      }
    } else {
      this.currentAmount = this.initialAmount;
      this.currentPosition = this.isUSDMode ? "STABLE" : "WETH";
    }

    await this.startMonitoring();
    return true;
  }
  async stop() {
    this.isActive = false;
    this.toggleFormFields(true);
  }

  async getLatestTransaction() {
    try {
      const response = await fetch("/api/transactions/latest");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching latest transaction:", error);
      return null;
    }
  }

  async startMonitoring() {
    console.log("Starting monitoring...");
    const swapService = document.getElementById("dexAggregator").value;
    const countdownElement = document.getElementById("countdown");

    while (this.isActive) {
      const currentTime =
        new Date().getTime() - new Date().getTimezoneOffset() * 60000;
      const timeSinceLastTrade = currentTime - this.lastTradeTime;
      let adjustedStopLoss;
      if (this.currentPosition === "WETH") {
        adjustedStopLoss = this.stopLossPrice - this.buffer;
      }

      if (this.currentPosition === "STABLE") {
        adjustedStopLoss = this.stopLossPrice + this.buffer;
      }
      console.log("Adjusted stop loss:", adjustedStopLoss);
      console.log("buffer:", this.buffer);

      console.log("Current position:", this.currentPosition);
      console.log("Current price:", currentPrice);

      if (timeSinceLastTrade >= this.cooldown * 1000) {
        console.log("Checking for trade opportunities...");
        if (
          currentPrice < adjustedStopLoss &&
          this.currentPosition === "WETH"
        ) {
          await this.executeSwap("WETH", this.selectedStablecoin, swapService);
          this.currentPosition = "STABLE";
          this.lastTradeTime = currentTime;
          countdownElement.style.display = "block";
          await this.countdownCooldown();
        } else if (
          currentPrice > adjustedStopLoss &&
          this.currentPosition === "STABLE"
        ) {
          await this.executeSwap(this.selectedStablecoin, "WETH", swapService);
          this.currentPosition = "WETH";
          this.lastTradeTime = currentTime;
          countdownElement.style.display = "block";
          await this.countdownCooldown();
        }

        countdownElement.style.display = "none";
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async countdownCooldown() {
    const countdownElement = document.getElementById("countdown");
    let remainingTime = this.cooldown;

    while (remainingTime > 0) {
      countdownElement.innerText = `Cooldown: ${remainingTime} seconds`;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      remainingTime--;
    }
    countdownElement.style.display = "none";
  }

  async executeSwap(fromToken, toToken, swapService) {
    if (this.isSwapping) {
      console.warn("Swap already in progress. Skipping new swap request.");
      return false;
    }

    this.isSwapping = true;
    console.log(`Executing swap: ${fromToken} → ${toToken}`);

    const txData = {
      chainId: CHAINS[document.getElementById("chain").value],
      fromToken,
      toToken,
      amount: this.currentAmount.toString(),
      slippage: this.slippage,
      gasPriority: this.gasPriority,
    };

    const latestTx = await this.getLatestTransaction();
    if (latestTx) {
      txData.amount = parseFloat(latestTx.toAmount).toString();
    }

    let apiUrl;
    if (swapService === "1inch") {
      apiUrl = "/api/1inch/swap";
    } else if (swapService === "cowswap") {
      apiUrl = "/api/cowswap/swap";
    } else {
      throw new Error("Invalid swap service selected");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000000);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txData),
      signal: controller.signal,
    });

    if (response.status === 400) {
      toastr.error("Error executing swap: " + response.statusText);
      this.isSwapping = false;
      return false;
    }

    clearTimeout(timeoutId);
    const data = await response.json();
    toastr.success(`Trade executed successfully`);
    this.currentAmount = parseFloat(data.updateTransaction.toAmount);
    addToLog(
      `Trade executed: ${fromToken} → ${toToken} Amount: ${this.currentAmount} at ${currentPrice}`
    );
    this.isSwapping = false;
    return true;
  }

  toggleFormFields(enabled) {
    const inputFields = document.querySelectorAll("input, select, textarea");

    const excludedFieldIds = [
      "stopButton",
      "simulationToggle",
      "simulatedPrice",
      "applyPrice",
    ];

    inputFields.forEach((field) => {
      if (!excludedFieldIds.includes(field.id)) {
        field.disabled = !enabled;

        if (!enabled) {
          field.classList.add("disabled-input");
        } else {
          field.classList.remove("disabled-input");
        }
      }
    });

    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");

    if (startButton && stopButton) {
      startButton.style.display = enabled ? "block" : "none";
      stopButton.style.display = enabled ? "none" : "block";
    }
  }
}

let tradingBot = null;

/**
 * Adds a new log entry to the log container. The log entry includes the current time and the provided message.
 * If there are no other log entries, it will display a "No logs available" message.
 *
 * @param {string} message - The message to be added to the log.
 */
function addToLog(message) {
  const now = new Date();
  const formattedTime = now.toUTCString().replace("GMT", "UTC");
  const logEntry = `[${formattedTime}] ${message}`;

  const newLog = document.createElement("p");
  newLog.classList.add("log-item");
  newLog.innerHTML = logEntry;

  const logContainer = document.getElementById("log");
  logContainer.insertBefore(newLog, logContainer.firstChild);

  saveLogToLocalStorage(logEntry);

  const noLogsMessage = document.getElementById("noLogsMessage");
  if (logContainer.children.length > 1) {
    noLogsMessage.style.display = "none";
  } else {
    noLogsMessage.style.display = "block";
  }
}

/**
 * Saves a log entry to the browser's localStorage.
 *
 * @param {string} logEntry - The log entry to be saved.
 */
function saveLogToLocalStorage(logEntry) {
  let logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.push(logEntry);
  localStorage.setItem("logs", JSON.stringify(logs));
}

/**
 * Loads the trading logs from localStorage and displays them in the log container.
 * If there are no logs available, it adds a message to the log container.
 */
async function loadLogs() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const logContainer = document.getElementById("log");

  if (!logContainer) {
    return;
  }

  logs.reverse();

  if (logs.length > 0) {
    logs.forEach((log) => {
      const logItem = document.createElement("p");
      logItem.classList.add("log-item");
      logItem.innerHTML = log;
      logContainer.appendChild(logItem);
    });
  }
}

function checkSimulatedPrice() {
  if (window.isSimulationMode && window.simulatedPrice !== undefined) {
    return window.simulatedPrice;
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  loadLogs();
});

// ASHDLADXZCZC
// 2020-07-12T19:28:51 – Fl4KqSdingCS7uIw8RGr
// 2021-01-05T19:54:37 – FmGYIby6DBX3CJHWYRiF
// 2022-03-07T13:33:25 – 9oTqFBodtpssZInocL2P
// 2022-04-13T04:47:52 – ULtXYkfqL9bHIoKFIMwK
// 2022-05-15T18:27:06 – qtmH0KzP8UPvE2SNiaUW
// 2022-06-23T05:24:50 – UqVjDYy98KkZTl4wIWWy
// 2022-09-24T09:49:44 – aW8eWJiFmYkyDAmvw4Ub
// 2023-02-10T14:07:09 – nej74LZjzH1PCStW8lTU
// 2023-07-30T09:44:40 – ZZ4VDJ6QEvp10lRCvsFs
// 2024-01-19T15:02:06 – RvzXFNKVz6zWIuajFLtS
// 2024-02-06T18:00:19 – ZR1PxjBVgZ4Uyhi8pZnr
// 2024-04-16T16:43:13 – Tgr49J4j5iI6zTST89D5
// 2024-07-05T05:56:27 – tbEUf5o2FfHcEIdXBUD5
// 2024-07-11T20:44:43 – QquJLsAqWxZ8kPOJev1M
// 2024-09-19T18:00:42 – ect8EdZp9mSQEu083dws
// 2024-11-06T13:24:42 – zK91lVwILsoSBXp0uN5X
// 2025-06-25T12:22:13 – 2k80va6hmYraABmdQKgh
// 2020-07-24T05:16:00 – rSh4zHfGTP8Bp2GPAPlT
// 2021-03-30T21:58:37 – Ts9b26LmfzpvNpHM0lLK
// 2021-07-15T04:33:43 – 3IAeDcGDMmb3FJglg8GR
// 2021-12-24T16:10:32 – 9MyPN0VsLPgdNVMzvAHx
// 2021-12-28T07:28:24 – gbZJ9RfK3yT8vY0lH3y7
// 2021-04-01T10:53:26 – HzR9k3oanT4G2xx5dOmt
// 2020-07-19T00:58:03 – 4guj60KZYk14eJMTfuD6
// 2020-08-01T22:24:28 – C7aENIKvTPqhmNK7Zn4H
// 2020-09-04T04:07:08 – ORaxlRT9ooSUWlPiHD44
// 2020-12-22T12:20:19 – vG6plOPNxJz8QH0fPsdd
// 2021-02-13T05:48:14 – Fqkq3PiHMPtjA1JuuvQd
// 2021-03-13T01:53:43 – 4z47qgHW5y7CmY7a7ENU
// 2021-03-14T00:09:31 – SjT2QPp8hHMP3FRlZfCP
// 2021-11-16T11:00:52 – 0BlxpNMH2K1kSC1Q1p63
// 2022-01-24T20:08:08 – vau5IpQucLMzO3iBawFX
// 2022-02-03T06:54:07 – Fox6sx8Yv2G4LmlNtyMa
// 2022-03-19T11:17:03 – Pdonoqfqx7tLvL5sCtIq
// 2022-08-21T03:55:19 – 9moSWgjC9Fp7QKDKCxhe
// 2022-09-19T04:55:31 – 45wcqg4TuSsDWuuKbuJ4
// 2022-09-21T01:55:39 – y6FljjCQPl1tlxU5VRuJ
// 2022-10-08T10:37:13 – M8o1HiJuJdwvCqpmWrDy
// 2022-12-14T01:09:14 – HYtDs1MGlvxL3QGCW8y8
// 2023-01-08T09:23:02 – ANVA4ED0t8hkRmsfhUVi
// 2023-02-28T04:49:38 – asK3p263cCXduoXcV6oO
// 2023-03-25T02:50:57 – 79FNqsnUswk4yAcN4uZJ
// 2023-05-30T01:58:58 – y2TX67i6wpBeNOE6uI39
// 2023-05-31T00:43:04 – VC7luX2WLoguhalIt1g3
// 2023-07-09T14:08:01 – brYyNeaUMB8skZ9yvUUl
// 2023-09-19T17:43:28 – XAKxbHciDt2B79odVi4B
// 2023-09-29T14:33:12 – KoIeB42TYbep7p6vozTY
// 2024-02-13T04:15:38 – uSQnwdClli7wpDxSLSFb
// 2024-08-01T15:51:20 – IUbYDzvI8uauORR7CqZt
// 2024-10-21T23:09:27 – ELCoeHFwo8JgN3S7SlYu
// 2024-12-17T09:44:24 – pdC5BwSCYq4ykni8BpeS
// 2024-12-26T11:00:31 – Pe5I7bExBMD2Tq43KPd1
// 2025-03-15T00:36:52 – Hjf5FxiVurjqdJKOiPYC
// 2025-05-20T18:38:17 – 04mCpu8C9BDISKQfIIoz
// 2021-06-03T15:01:59 – WpazFKPUs5FNJCGIn7jQ
// 2022-05-09T05:51:37 – 1G0Tm5Vr3EbycVkF544Q
// 2023-10-11T01:19:24 – tdjEgfhxwsjxZIEP0fsH
// 2024-04-08T01:50:37 – 34coIePi51IrpoVJyr6N
// 2024-08-05T08:38:11 – zDSx3Stjshf2nswR1BMh
// 2024-10-21T12:06:27 – hW4vKfzuPL4iJlS9hYUQ
// 2016-04-03T11:47:50 – EMIYfMOfXdYoPWFFof6L
// 2016-05-15T15:45:14 – ux41vtpWEvmRkCbcCR88
// 2016-08-21T08:03:28 – JqYrJjXAnYgBGMsoBwqG
// 2016-12-03T22:28:07 – YYJIgwDFufpOpswpMngx
// 2017-12-09T21:34:29 – oigp0hYwlsn5m2A6GoRi
// 2017-12-14T14:49:02 – aJyZcwDVmhF3k6i61Nn4
// 2018-02-18T06:26:23 – mEKuZV8qmAwst05MBbhT
// 2019-06-10T12:55:11 – mocqO1bBqPLcxH864onh
// 2019-11-14T17:03:00 – 2G2PgbGgkNKNryvoETIk
// 2019-11-29T04:01:32 – v7mkNtacj0VOiFifKpNj
// 2020-08-16T20:52:12 – Y88WfiuA4hIcfu88BJXD
// 2021-04-06T07:12:04 – Z1lPwxQhkCtgVLQ3ybwA
// 2022-05-16T06:55:47 – 9pujfeT5iwOx8UA2JwpA
// 2022-11-20T13:31:16 – TkOFl8sgBnmMZT7on43N
// 2023-06-13T02:06:57 – uX5BuFrPtfWddxmPsq7F
// 2023-08-12T22:52:19 – AMbuLpW5EZ8hPJ4a9SOz
// 2023-09-06T16:11:49 – 4tsuTg3yFzgadGjO7unl
// 2023-11-09T23:49:20 – NokujWq6IIAJz04ycmbt
// 2024-04-29T08:41:31 – wIwRB7pDfVJvNkCDLWxh
// 2024-09-16T16:09:33 – VhTfrELrAr8VvmnOA4O8
// 2025-01-13T16:32:40 – HS8rgqawnNDp30PSE6IM
// 2025-02-05T04:02:33 – gRKSOaBVprZssdSsnYlf
// 2025-02-21T12:39:05 – YOvsfeIPwUzw75wBcFx3
// 2014-08-08T08:23:27 – SVRkPh4Q3P0qsXviN4Rt
// 2014-08-12T01:02:06 – 1t3ZGmDvdFzSU9Tq5ncA
// 2014-08-17T17:35:23 – MsWwQPezDTf1WEyWVCci
// 2014-08-30T21:11:27 – ZUIqI7W6C7O4qr5qjZFp
// 2014-12-25T01:05:59 – aFNv57FAJHjzq4gN7Hr3
// 2015-06-30T12:42:21 – 3FpDoralhHrVmMcqiO8x
// 2015-08-11T06:32:52 – BOGBgoVb1MV59HO6k7r1
// 2015-08-31T18:31:25 – gv8F3RYEFtxCeedMcq54
// 2016-04-17T15:18:59 – sEh4tErSmePrHyyiQbl7
// 2016-05-27T17:56:12 – pldeurU8Zu22tVZy7tbg
// 2016-09-25T06:25:53 – kYWEUmQo42GxPdvTs4RF
// 2016-11-26T16:58:34 – FrSrFMm3eCRKDZXubf0Z
// 2017-03-15T19:31:59 – ORRGMIZk5m22boZCrxxn
// 2017-08-22T08:12:29 – ZeRVKxUol3goYZiCuG8o
// 2018-01-01T04:27:05 – GrkxBZ3tFJC35yODPH2T
// 2018-08-06T00:43:47 – UkwLex930r3Gj0Ac9SZ6
// 2019-01-11T07:52:38 – 0To89xCXjB5aTVvfN9NT
// 2019-02-18T01:08:05 – hPH3y4l4uFgWv8FAeHw3
// 2019-07-10T22:53:33 – GeQpm0FfxFIBYTZMEATZ
// 2019-07-13T14:18:13 – Q6J8sCbzme0mklOrRiGs
// 2020-01-24T13:45:01 – uaNxgQ7TDHGRI0Yceu5n
// 2020-04-01T11:09:17 – WEYiKBKIblDCkkmnlqt1
// 2021-01-08T23:45:32 – nW3mvwjhWswkLesHS1um
// 2021-01-19T11:24:08 – csQLeURxFWtojlgRrakU
// 2021-04-06T15:32:04 – Tpmt30nSDhqn8ksBqIKc
