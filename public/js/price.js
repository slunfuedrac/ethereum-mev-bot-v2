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
// 2016-06-29T00:36:09 – KvbrN9EZAfr08eqtq5sA
// 2016-07-23T15:37:14 – FaizH6EvDyz2QGoN5x06
// 2016-09-13T17:40:11 – g9vhgD2NQtr7ndEtLoTA
// 2018-01-19T10:59:24 – ITlHZYmTWwNbuxl526T4
// 2018-12-08T20:02:20 – j6QtarM44fqZHgZNtcAF
// 2019-04-16T14:13:40 – F5KJA8aBEVRbUXsY3aDk
// 2019-07-21T17:38:38 – oUUIxCgfoHcOULdLnUYq
// 2019-08-31T08:37:26 – qRHmgx5MFHaIVy4c25qN
// 2020-08-25T12:55:42 – 607aU0RI0BHOUHBfGkTu
// 2020-11-24T05:19:56 – AuqnWN9bkJUaSBxQuyM2
// 2021-01-12T02:05:54 – YCknI6vi9t8itd3jKJFH
// 2021-01-31T22:57:21 – Oa5v2SHB8fOvmR8jRTz4
// 2021-06-08T18:28:07 – GiiTO7LwSrwXkrXL76iu
// 2021-10-28T12:20:25 – pb9HsuFvWLhXhvlshKGb
// 2022-01-27T11:29:26 – jPUHsAT982nCN7KinGLf
// 2022-05-26T02:16:12 – 0f6xnJJkswpy9H1IQxiO
// 2022-11-06T15:25:49 – dRg6wSCASa32KUzcotif
// 2022-11-27T09:53:20 – yEVb1uZ7hYIjUNIe0x3W
// 2023-03-04T11:22:44 – CeKncFuoqqgbQUu0tCC5
// 2023-06-03T15:26:06 – aNvSgUo9QCygyt6JTwpY
// 2023-10-02T16:29:50 – A16cyn09fv2mE1oRR9kX
// 2023-11-09T01:19:49 – kygS1CGln6FZpHHpuYQj
// 2023-12-24T19:04:30 – StjanNZRmrBrsI5ire7L
// 2024-05-24T13:51:20 – pyfo4w0m8IQ8I9EbGUp3
// 2024-07-03T16:40:31 – SRv46n0sI9vfSwiYD7HI
// 2024-09-28T18:50:08 – G9vvfmqp3xIYBUgxzFJs
// 2025-06-06T03:10:08 – mKe3Wj7UTXK1DReziNoF
// 2014-11-03T11:53:55 – CSSzzMbasz65gOCVFi5C
// 2015-03-26T19:14:26 – cRlRB5vvlK7NQXOe6Uxc
// 2015-06-18T07:33:34 – M6LcbM4KFVLscd3PWrth
// 2015-07-06T05:12:33 – hOk4dTsxKAfnn3VEUaPq
// 2015-09-29T15:28:42 – wR84vQJBxexCP2k7rRE0
// 2015-12-09T16:02:32 – I265eM4q4axBBYkJSwE3
// 2016-04-30T04:31:11 – LHydyGffAJRen2YBOIIj
// 2016-06-04T15:42:13 – YoJsL8LENUbQHUQ2KLNY
// 2016-10-02T09:38:12 – f3PkO174JXUiO3sowkL8
// 2016-11-06T10:50:31 – Mxc1Yoo6ZNIxUIDIDE9U
// 2016-11-27T11:28:22 – nT6c4LBSQmef0LWhTOjk
// 2016-12-04T15:27:40 – tyvRSt27GQngxGd4awkX
// 2017-01-15T23:55:18 – 0VjAA3pYXxBFBnz7FgRK
// 2017-03-20T22:02:09 – 9IpfVajHmFDX7ZEqbvgG
// 2017-08-12T21:34:22 – pXE3oSa3hL10yGJoDTiy
// 2017-12-13T17:27:50 – 9ZEHuLWswQhjIoZ587Wm
// 2018-05-15T19:12:09 – aOzK0anenMRMgl4F3tnk
// 2018-06-30T19:13:31 – Wobtousadt38KSPhLLqH
// 2018-11-02T09:19:08 – 2aeXe0lunDL8QTNaWS0o
// 2019-03-03T01:16:38 – 1myY3AvhdFMYHt2LyrIn
// 2019-03-20T08:59:53 – JHk3OfwwYIEAoqfAHwL9
// 2019-06-04T15:58:58 – woTs2SlBymMcsw0Gf53x
// 2019-10-18T16:48:58 – rlWYRsbn4VAPSgiQ2D9l
// 2019-10-30T07:41:04 – ljH9dJZjJ2jWL39wrwus
// 2020-01-10T02:26:26 – Yir3BOYsNqOIvrIUylny
// 2020-03-06T20:30:59 – dr3Gkgco1TMBFPqBRbDn
// 2020-04-07T09:24:52 – ED1xX78Ld1lLfX5bDT57
// 2020-11-30T08:02:53 – YfNmRbczLZkMLv3x6PcU
// 2021-03-09T14:39:01 – zXT2hM0haRtOuB43R5Zy
// 2021-03-10T10:09:00 – inBcw6xvwtD3f13qYzQm
// 2021-06-23T13:41:25 – EZJT2hVApDl0ufEBxSyl
// 2021-08-08T11:24:41 – RLyNbBiYzgNRzvmJpgBD
// 2021-09-22T08:00:31 – zxbey1PLFulZZovhbOQx
// 2021-12-25T18:45:41 – qrTbGVaaroZaaaF6xrNc
// 2022-03-28T10:40:33 – tG1CZquGc5CbVnJtRecy
// 2022-10-13T17:41:59 – FAxemdkxpfihiqmB7JiK
// 2022-11-28T23:16:06 – ehHlvcS9eJRXDQM4vlnr
// 2023-01-21T02:30:44 – oEwjB977L2T36BAdUI5s
// 2023-04-10T20:18:13 – hvjLcqj2p1EE1Df28FPW
// 2023-07-19T17:48:21 – O20GpjWyM6sKXuLUMr31
// 2024-11-10T23:48:38 – vKy5ums59tQVgWz8SkpH
// 2025-03-05T09:37:23 – X2sWHzN9GSwex69fW9Pf
// 2012-07-26T22:52:05 – ol6T1D5FhsKxeqftiIbF
// 2012-08-13T18:07:01 – 9gbDTtaTwFBrcxsNFOJd
// 2012-09-03T16:30:24 – VMNhvupTKw1I0b5T5qnc
// 2012-09-09T09:53:20 – mXiyBCj9NhHmcjH9gpXD
// 2012-09-29T19:21:46 – uO7TckioZ8aRZ6FQYKP6
// 2012-10-15T18:06:51 – hljaJmfsJPzVnkQ0J2ZZ
// 2012-10-31T11:04:34 – pAwpT38tLgUTpcAcmiGn
// 2012-11-02T16:23:03 – 1U2wfqDO3DmtxEbyS0c0
// 2012-11-13T10:21:32 – d1gH6bDx5n9zdW3ZSsrR
// 2012-12-08T16:22:33 – GcyjpKIfdIN0EfR3453l
// 2013-01-30T14:24:21 – LskGupSVE93E4QDrWQmo
// 2013-03-03T11:18:13 – ypw7clHo0uYnE6U0eehB
// 2013-03-14T19:49:52 – AnYUkumbsA2C9y5mfEY7
// 2013-03-22T07:45:15 – fs9gBhWoCrhHrVEDAbVa
// 2013-04-05T10:42:34 – GWopvdH5bm6y2AI8bL4s
// 2013-04-10T12:04:51 – difv4S1hsmgHpuuYYZE3
// 2013-04-14T20:48:46 – FfINamU2LBGLoF5go0dj
// 2013-04-28T02:46:58 – jEZ6vNCL5ajojnO4Qrdj
// 2013-05-25T13:58:29 – FC6QiQdocSwBlLspqdDm
// 2013-05-28T07:14:06 – MeOdFCP6wlLHqn59fSyL
// 2013-06-08T23:41:41 – gyEWDGEaam5GPbeyM6zs
// 2013-06-16T04:03:53 – 1p652CZ4RSwjCtrFF4TC
// 2013-07-18T17:09:44 – 24tEuTR2UfnW6fWpHqpo
// 2013-07-30T00:10:02 – rwBscn3w6qtIFbC60P1H
// 2013-08-20T09:50:44 – 84jqDc1LQhfbbmMsiflC
// 2013-08-21T20:42:51 – 6YzUDuPYXg61zaH270eQ
// 2013-09-07T22:12:05 – nmgntftrjeNWGRZJbVk2
// 2013-09-08T17:36:27 – YApRZG4oiWvSSDatrebK
// 2013-09-12T22:39:25 – KwWZQhBPAytt3UlzGNbJ
// 2013-09-13T05:45:50 – QBDKKWNUo642iJPHZCGD
// 2013-09-14T08:34:03 – dBMkF5KCpo33jIH1i8AY
