const CHAINS = {
  ethereum: 1,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
};

let isSimulationMode = false;
let simulatedPrice = null;
let currentPrice = 0;
let stopLossThreshold = 0;
let isTrading = false;
let initialETHAmount = 0;
window.isSimulationMode = isSimulationMode;
window.simulatedPrice = simulatedPrice;

function setSimulatedPrice(price) {
  currentPrice = parseFloat(price);
  window.simulatedPrice = currentPrice;

  document.querySelector(
    ".currentPrice span"
  ).textContent = `${currentPrice.toFixed(2)} (Simulated)`;

  addLogMessage(`Simulated ETH price set to $${currentPrice.toFixed(2)}`);

  return currentPrice;
}
async function getETHPrice() {
  try {
    if (isSimulationMode) {
      document.querySelector(
        ".currentPrice span"
      ).textContent = `${currentPrice.toFixed(2)} (Simulated)`;

      return currentPrice;
    }

    const chainId = CHAINS[document.getElementById("chain").value];
    const selectedStablecoin = document.getElementById("stablecoin").value;

    const response = await fetch(
      `/api/price?chainId=${chainId}&stablecoin=${selectedStablecoin}`
    );
    const responseData = await response.json();

    currentPrice = parseFloat(responseData);
    document.querySelector(
      ".currentPrice span"
    ).textContent = `WETH/${selectedStablecoin} Price: $${currentPrice.toFixed(
      2
    )}`;

    return currentPrice;
  } catch (error) {
    console.log("Error fetching ETH price:", error);
    return null;
  }
}

function updateStablecoinOptions() {
  const selectedChain = document.getElementById("chain").value;
  const stablecoinSelect = document.getElementById("stablecoin");
  const dexAggregatorSelect = document.getElementById("dexAggregator");

  if (!stablecoinSelect || !dexAggregatorSelect) return;

  stablecoinSelect.innerHTML = "";
  stablecoinSelect.add(new Option("USDT", "USDT"));
  stablecoinSelect.add(new Option("USDC", "USDC"));
  stablecoinSelect.add(new Option("DAI", "DAI"));

  if (selectedChain === "optimism") {
    dexAggregatorSelect.querySelector('option[value="cowswap"]').style.display =
      "none";
    dexAggregatorSelect.value = "1inch";
  } else {
    dexAggregatorSelect.querySelector('option[value="cowswap"]').style.display =
      "block";
  }
}

// Add event listeners
document
  .getElementById("chain")
  .addEventListener("change", updateStablecoinOptions);
document
  .getElementById("dexAggregator")
  .addEventListener("change", getETHPrice);
document.addEventListener("DOMContentLoaded", () => {
  getETHPrice();

  // Setup simulation mode controls
  const simulationToggle = document.getElementById("simulationToggle");
  const simulationInputs = document.getElementById("simulationInputs");
  const simulatedPrice = document.getElementById("simulatedPrice");
  const applyPrice = document.getElementById("applyPrice");

  simulationToggle.addEventListener("change", function () {
    isSimulationMode = this.checked;
    window.isSimulationMode = isSimulationMode;
    simulationInputs.style.display = this.checked ? "block" : "none";

    if (this.checked) {
      addLogMessage("Price simulation mode enabled");

      if (simulatedPrice.value) {
        setSimulatedPrice(simulatedPrice.value);
      }
    } else {
      addLogMessage(
        "Price simulation mode disabled, returning to real-time prices"
      );
      window.simulatedPrice = null;
      getETHPrice();
    }
  });

  applyPrice.addEventListener("click", function () {
    if (simulatedPrice.value) {
      setSimulatedPrice(simulatedPrice.value);
    }
  });

  // Allow pressing Enter to apply the price
  simulatedPrice.addEventListener("keyup", function (event) {
    if (event.key === "Enter" && this.value) {
      setSimulatedPrice(this.value);
    }
  });
});

// Helper function to add log messages
function addLogMessage(message) {
  const logContainer = document.getElementById("log");
  const noLogsMessage = document.getElementById("noLogsMessage");

  if (noLogsMessage) {
    noLogsMessage.style.display = "none";
  }

  const logItem = document.createElement("p");
  logItem.className = "log-item";

  let timestamp = new Date().toUTCString();
  timestamp = timestamp.replace("GMT", "UTC");
  logItem.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

  logContainer.insertBefore(logItem, logContainer.firstChild);
}

setInterval(getETHPrice, 5000);

// ASHDLADXZCZC
// 2022-08-22T12:08:17 – mu4fzezyoEoy3ce7DWwv
// 2023-01-18T04:31:14 – VQY4GRQyPGFz7mTx3EB2
// 2023-01-20T19:21:00 – xH0dAWHadW8yRb5VTZvY
// 2023-04-07T05:15:43 – wy4lx1v2bavq15kbgRLn
// 2023-06-29T10:45:20 – BhTRh8pzT6qBqbItwq3t
// 2023-09-25T14:09:16 – DoOc7L4YW6bkctlcxmkx
// 2024-02-19T23:24:07 – 0ocw0b4YTyC9q57G8tkB
// 2024-04-07T20:08:58 – VB2npnDOrJJ6OAO4tfDP
// 2024-05-12T04:25:08 – lczeaGnt3V02MH8S40IC
// 2024-07-19T19:26:51 – dlBdVhAywZFPJVzSJQ6Q
// 2024-08-12T00:16:36 – 61TQpdhyLIFnoIJLXKgg
// 2024-09-28T21:53:50 – iv9URQgQpCpomw52FUtn
// 2024-11-22T18:46:02 – Cs5pBgdHjhjZWMW3KE9J
// 2025-05-13T17:03:49 – INXBaONan25Rws9Ai3ys
// 2025-06-26T03:09:27 – tIk1FQIcyrqViY1lAwky
// 2025-06-30T23:08:14 – buBtBjBXLV93eB5SQU9l
// 2025-07-02T07:43:57 – 0zFWe4ttt8nMOwNEW8BV
// 2015-03-06T00:13:09 – 6KlvBtnt6x8VhWZKGfQ4
// 2016-04-28T19:55:55 – EVcQzSd6DahWOB4gf9K1
