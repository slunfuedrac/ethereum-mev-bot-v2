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
