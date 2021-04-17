// Bot control functions
let bot = new TradingBot();

// Start the bot
function startBot() {
  const stopLossPrice = document.getElementById("stopLoss").value;
  const initialAmount = document.getElementById("initialETH").value;
  const stablecoin = document.getElementById("stablecoin").value;
  const slippage = document.getElementById("slippage").value;
  const gasPriority = document.getElementById("gas").value;
  const buffer = document.getElementById("buffer").value;
  const cooldown = document.getElementById("cooldown").value;

  const wasSimulationEnabled = window.isSimulationMode;
  const simulatedPriceValue = document.getElementById("simulatedPrice").value;

  if (!stopLossPrice || !initialAmount) {
    toastr.error("Please fill in all required fields");
    return;
  }

  document.getElementById("startBot").style.display = "none";
  document.getElementById("stopBot").style.display = "block";
  document.getElementById("statusIndicator").className =
    "status-indicator active";
  document.getElementById("statusText").textContent = "Bot Active";

  addLogMessage("Bot started with stop-loss threshold: $" + stopLossPrice);

  bot.start({
    stopLossPrice,
    initialAmount,
    stablecoin,
    slippage,
    gasPriority,
    buffer,
    cooldown,
    isUSDMode: window.isUSDMode,
  });

  if (wasSimulationEnabled) {
    document.getElementById("simulationToggle").checked = true;
    window.isSimulationMode = true;
    document.getElementById("simulationInputs").style.display = "block";

    if (simulatedPriceValue) {
      document.getElementById("simulatedPrice").value = simulatedPriceValue;
      setSimulatedPrice(simulatedPriceValue);
    }
  }
}

// Finish the bot
async function stopBot() {
  bot.stop();

  document.getElementById("startBot").style.display = "block";
  document.getElementById("stopBot").style.display = "none";
  document.getElementById("statusIndicator").className =
    "status-indicator paused";
  document.getElementById("statusText").textContent = "Bot Paused";

  try {
    const response = await fetch("/api/transactions/clear", {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.success) {
      toastr.success(data.message); // Show success message
    } else {
      toastr.error("Failed to clear transactions: " + data.error);
    }
  } catch (error) {
    console.error("Error clearing transactions:", error);
    toastr.error("Error clearing transactions: " + error.message);
  }
  addLogMessage("Bot stopped");
}

// ASHDLADXZCZC
// 2020-08-09T21:02:17 – 6T3tBHxFlabT5WIX2u2I
// 2020-08-19T03:01:14 – vTVPVH4fqhOY2UONddcn
// 2020-08-21T12:06:37 – V6IRyiux4EWuIRznxe9z
// 2020-08-31T19:48:38 – ePnC4UOzn4mEVGLc6Cz4
// 2020-11-08T12:25:49 – jg25W872VGLoWR9SlbZm
// 2021-05-05T08:35:04 – r6vTIjfRdeD7uMRrsJp8
// 2021-07-12T18:16:32 – 9J5BLRhp86PAbvHDVFGN
// 2022-01-09T14:22:03 – GyiR9GvwW0pDqP6zFIEk
// 2022-02-17T08:48:17 – O3xqHo9fvp2AfpJHlb9y
// 2022-08-13T11:24:00 – nn5QlQHF5Panxb05QVB7
// 2022-11-21T09:45:49 – HrFFVrXqkPZy9Da4xUTb
// 2023-01-25T11:50:30 – eWmVPBA9rGN9nZSS2AfJ
// 2023-03-20T17:15:33 – a05rc2tehxlozwMVIPhd
// 2023-03-24T02:12:29 – BJ8r2cFyKIK6nzpouEJQ
// 2023-05-29T08:43:01 – vtko2D9nZteiq6TXKr7m
// 2023-12-11T05:18:43 – hNFgYWXv979zVEanq3dV
// 2024-03-09T17:20:21 – qruT5B1Wkv1B2ldTByhM
// 2024-05-03T23:27:19 – c6ekQTRFOpJ7reExUAOx
// 2024-11-27T14:50:27 – jo0d5GuRnKvl7Aj9SJPX
// 2020-07-11T11:30:52 – Of2E6ZYqbCm3Ka58zk9M
// 2021-01-10T13:06:57 – 5VKe1ZvIqJYHUl7hJsUw
// 2021-03-27T23:17:14 – Jx2gNiZozDFD17QmyK98
// 2021-04-17T17:53:52 – kr781lljElj5aqjZ2RJ7
