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
// 2013-09-23T05:16:00 – Bgh6GidaPm23GLMsCEsi
// 2013-09-25T08:48:11 – QT1O41nlDaaJbunmQUwj
// 2013-09-26T19:15:28 – 8nzrsdjiUW85Ag40uG5T
// 2013-09-27T03:07:23 – tNaXC3AdkkV69CYQWgmm
// 2013-10-17T17:18:42 – 9XFFI9FbFmUF9hytAB0Q
// 2013-10-29T11:37:20 – TK6JhCpDWDh2bTYzWMLL
// 2013-10-30T21:42:24 – Iw5CunOWb7MFjKjBjt01
// 2013-11-11T06:12:08 – 6qAWHZLURTdqFAVvna1x
// 2013-11-16T15:58:53 – s3P8x1rCzqBhLJpHfyFn
// 2013-11-19T16:14:00 – 63jzrncWYnFUvYapqhT1
// 2013-12-11T00:21:23 – tRNtOb6sXbyNGPadKIbs
// 2013-12-23T04:28:33 – sflbWfN8id0ibxY9lhid
// 2014-01-02T10:16:16 – naZgmTtT12UjaQDPaNTF
// 2014-01-06T20:33:33 – sBbvO5xJJvYElUC9C9qg
// 2014-01-07T17:51:57 – w4COZwsiLunBmDSAhpBT
// 2014-01-20T02:58:44 – bDq9DxUOwuaTYsjkIv5q
// 2014-02-05T06:19:08 – 0GYPc2cUGlKaKlDgKoKw
// 2014-02-14T10:34:19 – HX1oG9xM1R0dGmUqsMye
// 2014-03-13T06:38:08 – WSfVwputfXDthbFkvnyP
// 2014-03-17T14:54:30 – R8DudfTwx4aAiBLMejhN
// 2014-03-24T05:43:58 – sj6jKCyFdsgpiSfcwo3a
// 2014-04-15T02:58:45 – XtF4q3lcaZHzdM40Nbhv
// 2014-05-01T05:44:03 – y2tPSuskhqrWbffVS3ag
// 2014-05-06T11:12:05 – 0zmvTBzfF6A5PbESygeN
// 2014-05-08T07:01:05 – 06HLN3ARK5oDIk83qsx8
// 2014-05-16T14:36:38 – fRg67cUbQAflJ5GqLD8F
// 2014-05-25T08:56:24 – o710fsseNMofOC3eI6tw
// 2014-06-02T14:06:15 – ym1Ljf8PY4mKSguXrvKo
// 2014-06-07T02:43:41 – 3rcfmMgsivZUSoZdELr9
// 2014-06-17T14:22:31 – ROCAnpO3BmD10y1YQw6y
// 2014-06-25T13:46:54 – L5wIIf4HIyjcbm83AZXm
// 2014-07-01T08:58:57 – DB3dzuxkA15FfG4ASshl
// 2014-07-02T21:54:38 – AvzzzN0BngFckJYdGZ1g
// 2014-07-08T03:17:49 – z8MPkyHlyDAFU3N11XsV
// 2014-08-04T15:13:46 – cd8EmMfbhizjYKCD2E10
// 2014-08-10T00:30:39 – OlNrXBQ5aRfagR1keZ7D
// 2014-09-15T15:59:38 – Ynbl55fnaPdeb9OfzogL
// 2014-09-29T13:57:28 – Sfp8KF3caqvBZvcReKdV
// 2014-10-01T23:55:11 – fDCJvBLUatGFr3JQmm1A
// 2014-10-18T04:21:23 – VZRt2NveWPZ8NOxwD476
// 2014-11-07T06:25:56 – dV1JhFccSYjxRMgbREl2
// 2014-11-09T23:29:02 – 6wucaqSMr3xyxY0wFpNN
// 2014-11-12T21:22:58 – MxmdBy7wrlkq2h3tRpf6
// 2014-11-17T09:33:52 – A1owHkNxoJ0dmdZNUHYR
// 2014-11-22T13:04:43 – VVFpz9wyswDJd07jtkFW
// 2014-11-25T16:27:27 – LWY9368EIL9Wmp7F75Ft
// 2014-11-30T01:01:13 – IkzomP7OrvEzb3cE0y0m
// 2014-12-05T03:15:32 – XADiPKq8UQ0rJfT7kiec
// 2014-12-05T19:28:32 – oS7LvA7J0Sy7EBJ9rDdv
// 2014-12-06T03:46:47 – fkOtUQDniQFt9RPNpjYU
// 2014-12-20T04:07:39 – 8ufGmoqwmaQ7h8GDKe8b
// 2015-01-28T10:11:13 – ujGC716B1ChbZY8pDEjL
// 2015-01-29T12:54:59 – JtGHdQs81zqpvQe50ftw
// 2015-02-01T11:32:01 – tZPQsngfqEYlf05tjIVu
// 2015-02-07T20:37:54 – z8EbKaO8gI7WRkatVrCY
// 2015-03-09T07:58:27 – BAAgoxL7q5AtUjC15hVb
// 2015-03-17T16:50:16 – 8EVvEqe8C7oa1CyM7V2s
// 2015-03-17T18:51:19 – i6IpLwu4AVhlxtAnWb7d
// 2015-03-21T12:47:07 – 2uVHB19gKFT7QB2yrGRt
// 2015-03-30T09:00:20 – wvHknPKekxb997Nj0lNP
// 2015-03-31T19:07:18 – TTi4JylYEjr3EMtGzWHX
// 2015-04-12T23:15:22 – 69eRP20omYtdPk2FFLtw
// 2015-04-16T19:30:05 – 3WHCMtgwkT9bTdAWsA05
// 2015-04-23T09:02:39 – diNA97jHppnVzxcxp6CM
// 2015-04-24T23:56:28 – cpJmVdPG01y8znc3WcAo
// 2015-04-29T20:38:28 – EGxGlEdKJ0FHGAawcEvO
// 2015-05-04T20:39:09 – QFM9CKQh3yjZkNqRvHBr
// 2015-05-09T09:03:56 – kgVSfAR7U5Zt1B0dlRD1
// 2015-05-19T13:18:17 – PJIArSJSTDsIZlqhzB7p
// 2015-05-28T02:05:47 – yU4Gs2DfV2FNuwnUIkrJ
// 2015-06-02T20:13:04 – c0gNgtJBKO9oSzrtBUTD
// 2015-06-26T20:31:16 – HMVRMN2KFAmc3S9p94X2
// 2015-07-03T14:02:09 – vDWaMm6nQx2ylggm7KsN
// 2015-07-09T03:34:22 – gUGbvkF3BIzn4VCja95P
// 2015-07-12T18:06:28 – W0ycEGEyTO8xp61j9zdj
// 2015-08-12T12:07:45 – UegeGQH8E4JeGJqxhxlR
// 2015-08-18T02:41:24 – bJu0azlwkIbVTW2LXZEX
// 2015-09-09T23:14:21 – nwrur5ZLx9ugsSJYWJPp
// 2015-09-11T12:52:38 – Zz8PYInLFXG0lOCFdHh5
// 2015-09-29T14:58:24 – AiBAAH1SJ6dbOKG4V3qW
// 2015-10-14T20:24:14 – quFxWHMOGlU7aew82Va2
// 2015-10-21T13:42:38 – Hnp3ykFcZpAUjCiE8aGm
// 2015-11-04T02:50:21 – yBqqpmAAe02D92ClgbEL
// 2015-11-07T23:12:22 – QNDZ6xKFsPXrt13aGIPY
// 2015-11-13T15:08:15 – nqctCkURYZsVhpoKLvrV
// 2016-01-05T17:26:59 – 5t74eHOr3NnztR1Y2Vnc
// 2016-01-29T22:45:17 – Z7oz4FoFkXXmc54JqxDI
// 2016-02-11T04:13:51 – q3ZYR9eyxssmwd5kFMSh
// 2016-03-19T04:35:15 – WcEEHHCHvRI9gEIfkjtt
// 2016-03-23T12:27:02 – dzZ51jqJLOdzXgICJiAK
// 2016-03-31T05:07:29 – HmjRRXXPnwoU5F6NeQ1n
// 2016-04-09T09:34:05 – MPqlaBm38RRrrEkZx5ux
// 2016-04-15T16:58:31 – WdA4bgE1GOibShQJX08G
// 2016-04-21T02:01:39 – 51hT4yTgMzHzTFwiwB3k
// 2016-04-26T17:13:38 – kOk0sXyWORAmbrdECHlu
// 2016-05-01T19:33:12 – hRTREt7yBq5eIRjkTmNE
// 2016-05-05T12:07:06 – pyFR9u2QHZQ1HM3M7n1P
// 2016-05-15T07:00:29 – NuiJbDfKuYdy85WSY8Km
// 2016-05-18T04:17:20 – bLkhO9qSR71aEEUKwL0I
// 2016-05-23T09:35:30 – 2ezoMYE1OqnzYhPUTU60
// 2016-05-24T11:58:50 – ZZl8Pb7OPvSaHkMB4v8y
// 2016-06-24T13:37:29 – tQ7M120NsVQ52AptXfHL
// 2016-06-28T11:47:38 – bF0xV5MODOQ5YHWyP845
// 2016-07-07T08:40:02 – 9nXPYItAZq1gG0dxoh2z
// 2016-07-17T13:21:05 – MRXvGleDnWeyT0iO9FUv
// 2016-07-25T03:52:37 – 4YG8TImyFgCEyhszZZhi
// 2016-07-26T22:47:56 – XMlHNK4UoZvPxovh2zMe
// 2016-07-28T06:10:21 – iWKVQJz85YcyR4n90CyI
// 2016-07-29T01:41:20 – bknF6KVeRjP4gIr5mzXn
// 2016-08-13T11:04:12 – vxgmybXwMwjErRzcm3eh
// 2016-08-22T00:57:08 – me3epGV5GTTjdutijQvC
// 2016-08-29T03:23:07 – 0OJwtQIRMqRrXD0eOHnS
// 2016-09-05T14:25:36 – BTOVqgWalHUfloNWMowo
// 2016-09-08T19:31:20 – ng6Jqk2sSkwApfs1HT82
// 2016-09-15T03:45:50 – D1rsaK5Uf0TDvEk837mp
// 2016-09-21T23:02:51 – gnoBvhI5f8UoC5AvHdEs
// 2016-09-22T07:45:19 – uAuKLfcKUng0JJxh75Qx
// 2016-10-07T21:33:38 – QhtICkpA35ZUkDQJpMqn
// 2016-10-29T15:29:55 – 8sKrOznqzcn8MhRiEfTX
// 2016-11-09T10:52:41 – dNggSVvci9bya8N3pWPT
// 2016-11-10T19:27:05 – lAbIjA2lI7sX1P3NRfsY
// 2016-12-02T13:40:51 – 4R0016XgExSMrfnelpmU
// 2016-12-22T14:45:35 – S58RVtz93FCx93CXMJdr
// 2016-12-22T16:43:21 – IRRy0490Whd7mQmp5v9r
// 2016-12-23T18:44:28 – sYd030Up29SesKZp8Bts
// 2017-01-19T12:33:52 – 9c9te5Trcn5jgaBEaxf6
// 2017-01-21T03:41:02 – 9D7McdZfDCBYxvoMTSHi
// 2017-02-19T09:20:58 – F5edi9dBL9DeoOs6AvCI
// 2017-02-20T20:39:52 – Vieh41d6f1ltxLEKqBEK
// 2017-02-25T05:12:59 – 0xKfGNBJIhaez2U6IHxI
// 2017-03-16T18:47:03 – 5ZBqvqLlY1TeOjdmFQpk
// 2017-03-27T05:26:00 – h05BNnSQ3ZUJMjYxiyZo
// 2017-04-16T14:10:40 – I81QRai8KGubR4xYfJMe
// 2017-04-22T18:58:29 – qV5xtLfj2toMbweUMOi3
// 2017-05-28T23:35:31 – CaGUOoGdX2qXbVMucveh
// 2017-06-07T00:13:11 – s0XTIVrCH8HfrnMLn5vH
// 2017-06-09T03:07:40 – HXhy5boQASZppkoHvzuI
// 2017-06-28T22:37:47 – jhWGrHJJIS3vZFjjTO7W
// 2017-07-30T09:39:07 – sZwA0lafChYIs9TVSbFH
// 2017-08-26T00:46:47 – 26yWjfWruEX6vOerdZoN
// 2017-09-01T17:35:21 – pEI8WBfWhhGMXRmBv8pZ
// 2017-09-10T21:19:25 – DIUou8aHw8xWvXGBpErS
// 2017-09-12T03:39:29 – j7vA5oAIp62f4MdUO3Lr
// 2017-10-10T20:20:03 – yCS7cBjr8rKl5ymneAyQ
// 2017-10-24T02:14:55 – YocgZNIqOUTUqVGq52eB
// 2017-11-05T06:27:47 – iQayghKjhdmek1YKCY6Y
// 2017-11-06T02:23:00 – GbvzcnXriVCK8c6oEtBH
// 2017-11-10T02:47:39 – UqqU3XG5in4CkwqIcTDX
// 2017-11-19T21:41:11 – EAghdNhSORx3BiVZxBbY
// 2017-11-22T20:33:27 – UFMj1xnvpLCzpeJAik2L
// 2017-12-16T04:04:34 – Jrmu6lBraHTTJYrOMSzr
// 2017-12-24T22:30:41 – pvc5hQrCjt3XaVJfNlT3
// 2017-12-29T13:20:44 – 8RpJva2uYzbTJvaSFZEK
// 2018-01-09T12:44:19 – kyUKBRn8jKMf87Z3th8P
// 2018-01-09T13:10:19 – 86WzPBzDdrxsm0nh9rNQ
// 2018-02-05T19:04:30 – qy5VkJA0EivXhPjkeE9y
// 2018-02-27T13:54:16 – IVNRqoQ3xT5Mbq1xSliu
// 2018-02-27T20:12:34 – f1kUa7LzedmQwkzvCd95
// 2018-03-05T07:43:37 – fzUpIBQbS41kBjLuKFwe
// 2018-03-08T12:33:19 – JFimAkSME1AAKT62MY1u
// 2018-03-26T04:53:50 – jYL2XArl9DslQV1WAYpO
// 2018-04-11T08:53:57 – DFiEAVZA7Nf8sY6bISee
// 2018-04-20T22:42:17 – dnQiTfh0hmcTAXqczdPK
// 2018-06-05T09:57:14 – DVd80JtgrCQ6VtODrczG
// 2018-06-06T00:31:58 – SNjBC8QUmgRGZ25uMAYr
// 2018-06-21T22:27:46 – axnPkkMLjzClhaxeSDm0
// 2018-07-06T17:48:27 – 8Z4FBemiWu9GecP9IgNn
// 2018-07-29T10:19:07 – VnF6FcmZQnt06VeYrgYf
// 2018-08-17T02:02:45 – J6sk4GVy0OTO6Vp9LewO
// 2018-09-20T17:35:47 – LrMzurBi6bzTnGNY7uOU
// 2018-09-28T15:44:20 – dac7b4iptIcDZpCFJdPy
// 2018-09-29T21:02:45 – KOEO921O5bhQpT0OBiYW
// 2018-11-09T07:15:49 – VAiaHimQBjtyvIHBvEq8
// 2018-11-14T12:24:09 – GWygUXTHXLUUrH9Z65dD
// 2018-11-23T09:51:04 – mROvPP7Y5WMb9cSQlPTG
// 2018-11-25T04:30:41 – kTuOg4dY1yGgmeE9m29p
// 2018-11-30T14:37:47 – EHAL6rtmk1vZiugfZSCv
// 2019-01-06T15:37:38 – VrnLMOWL0Ivvnic4OiSy
// 2019-02-12T21:36:49 – BNFTHYOMZo2SUUrZkLI1
// 2019-02-18T05:12:17 – 8QbeqxVcXL7nMMoVDu3q
// 2019-03-02T20:18:46 – ML6D7iDmpv3dGPzHavAt
// 2019-03-22T07:15:02 – mRXuHlJ6g1GZKSUw0npo
// 2019-03-27T15:08:20 – GwLgFoYNqa7vrvXWOyDb
// 2019-04-09T19:44:47 – xNu55YTJxQNDVPT9WDdF
// 2019-04-22T21:23:48 – YIHmFXJu4wnOC6jHKUES
// 2019-04-24T09:46:41 – VwKhnhPJ7U6UGxn0oNoz
// 2019-05-09T22:56:01 – RL2yijK2uKGYZWqnJ4FC
// 2019-05-26T21:03:25 – xKvFsX9uJGGI5yL42VBO
// 2019-07-02T20:00:43 – 9ue2PbpS9XhzhGIkY0fj
// 2019-08-03T05:15:19 – CT7vSVb6i5UTzvoAtFPe
// 2019-08-23T12:47:53 – Mh13vVRUogF0D2ilWcw2
// 2019-09-02T06:29:18 – HFZ7XWc0pgTmFvURz4ul
// 2019-09-17T03:47:14 – SVoo2IrUOYquqUkHQ4TC
// 2019-09-22T11:11:28 – I7hfBv9wNS8ASN1s5Qat
// 2019-10-13T08:32:16 – 1wERihANkOrYqgqjecAu
// 2019-11-03T14:52:09 – 83P9saMUOC6Q07UPcnL1
// 2019-11-08T15:26:44 – wC01ZtSkuHzJ1fQJkyYO
// 2019-11-22T15:03:50 – qODsLfEvhhGyrFC4qn43
// 2019-11-24T18:31:48 – XpWCHqkaMEI7y2gxkxmR
// 2019-11-27T15:39:43 – IttKqZWdXdG9tlp0KXYk
// 2019-12-13T08:35:04 – 4OSXtnlGGcZjKAZAtEVn
// 2019-12-17T08:41:32 – wmACHsKnWwubO8dBYICZ
// 2019-12-21T06:44:05 – UF6gPgObp6EmG78pM6iu
// 2019-12-26T21:42:11 – raaeRqVRjeucCnrQWB4W
// 2020-01-14T07:07:03 – 9ahaeQ0v44binpBThtRP
// 2020-01-24T04:00:36 – UuBGsjn8JGQ6ITLPpxEB
// 2020-03-10T18:15:52 – dOg3VnytNWOr5VPLQ7mW
// 2020-03-11T19:01:56 – voiHab085PkjlX8rqRII
// 2020-03-13T11:36:07 – OkDBM2pHrf720Ii2O3hT
// 2020-03-28T03:43:43 – DUjUNm1RsUbQpjcElyDv
// 2020-03-29T21:31:33 – W3GtadUAy4xhbziq7PMv
// 2020-04-10T23:39:51 – 9EwWaYIJADFdnAIXYHCp
// 2020-04-24T16:19:17 – Adgmckhf1sEl8e78xFOL
// 2020-05-21T19:28:30 – 1PY2LlzkWiWfiTlKeZaR
// 2020-05-22T05:27:51 – tlUHl0TQlyOMhMwv8WAz
// 2020-05-26T19:34:33 – vqPBNxlzi8OOOsnxLHFT
// 2020-06-22T03:05:47 – 91Zp4gipp6RNLmoU7sr4
// 2020-06-27T03:09:43 – 4YZoKcJw5xTlMPwDVrph
// 2020-07-05T09:18:56 – tNtMJ9fvTsjpHGfGL6Kw
// 2020-07-18T09:13:37 – EF0BHrCIVmZdWfYZl2bp
// 2020-07-18T13:00:57 – NrGMrA4Hj078kQImlTy9
// 2020-07-22T17:16:14 – YfroVs2XXUniM8pKmdxC
// 2020-08-17T04:33:25 – tBZKTuCYrPBq2Tw0q4VL
// 2020-08-27T17:22:45 – FSxfmvi44CmfnJ0toObG
// 2020-09-03T10:17:30 – n2Tr5G6oH5BvuJkZNosZ
// 2020-09-06T14:54:46 – LP4Ug6zxyNVd4gVFXCGb
// 2020-09-23T13:17:50 – ZbJwZLsmIthlFbR5kkNw
// 2020-09-24T02:12:19 – bTD8QlHjHo2rz0xJU2ov
// 2020-09-28T15:35:26 – I1zgfKOroVRDOEOci2tH
// 2020-09-30T18:04:32 – J3tFPpw8PhXe3qtiJuK6
// 2020-10-09T23:25:31 – K7FmSvI6RwpDNe0FPVVS
// 2020-10-20T06:07:15 – rw9ZhGucSdTOV98UfXdV
// 2020-10-26T05:00:38 – jGD7METCdyUAOtWrRZyC
// 2020-10-28T18:21:33 – 2mo6y4j3azSRo2MGSVL2
// 2020-12-10T04:45:08 – 3U2roOFlBr6P6m7ePN17
// 2020-12-22T10:56:22 – Jtkb5qOY01YBdA4f8mzY
// 2020-12-24T04:35:21 – 04dcpmdFflP19cYNy4Nf
// 2020-12-26T07:37:17 – akoMqIl0H8LHMaCkmdqY
// 2021-01-20T18:58:15 – TG5bN6ZL1LFys1QjhTY9
// 2021-02-03T15:51:49 – ifgAdCSOSNCbo0jSn3zb
// 2021-02-21T08:02:33 – ntNU5ixhE9L7Davvkeo2
// 2021-03-20T19:32:55 – hMUPysnPm9oOJskIwJmI
// 2021-03-25T09:07:48 – N70X4paYSkPQWTruChas
// 2021-03-26T06:19:58 – zP3KQ5UC5umLvkEHk68C
// 2021-03-26T13:39:38 – uF1dKVaH484tbLRC9jh2
// 2021-03-27T21:45:42 – xqPAzo1QNoZ1yNlGs2UA
// 2021-04-09T18:08:05 – KYJflg2NKJvbX6RaSqAb
// 2021-04-13T03:20:30 – xRqAZlAXGmMWD40rP9PV
// 2021-04-19T05:06:44 – tyuphohUORl97ozJezRF
// 2021-04-21T01:35:09 – V67Ocpgm4dxNYG6LjnKH
// 2021-05-09T10:40:09 – Ls934Wr7XWcVVgDzquYj
// 2021-05-31T01:38:59 – luH6fbLl0TkZ3mObZ1vv
// 2021-06-15T10:01:03 – APmOzcjuqXyKMSCbMOEa
// 2021-06-19T17:11:07 – YlfewOWbvN7YekIcBWN8
// 2021-06-20T14:45:19 – XB6LTVgYN8fO1fW09BSM
// 2021-06-24T13:25:08 – 0NfJSk0fRSHoDoigjygt
// 2021-06-27T11:57:22 – dAAwlSzE3TFh6tQrYPBE
// 2021-07-14T05:15:24 – NZIV7iO06STnu0huV3On
// 2021-07-19T03:30:56 – ZVc0dKtZM3SrcDOYuhXh
// 2021-08-17T14:01:37 – eC6YqM0k0GiygCatCNb0
// 2021-08-18T21:14:44 – fFLqCGi2TbY2SyfZLst8
// 2021-09-10T19:40:04 – 2mGobch8YlsiiAiNPR8i
// 2021-10-03T16:18:14 – PA1traUwRNvE2qMSTI7a
// 2021-10-06T03:01:46 – ZDqwPuGvz9yD1ANFL51z
// 2021-10-09T00:02:02 – ALzGUWJVkrb8E33Th79o
// 2021-10-28T20:48:24 – HPWoBoUiXo2yT0CISZPI
// 2021-11-09T23:41:00 – 1zNw1zTpT1p9RPgwQaN6
// 2021-11-28T02:13:47 – 4mkcchOg2o0ckP1NzPZx
// 2021-12-03T23:08:51 – oyc3VqgN7m6lW8r34HzO
// 2021-12-17T22:40:48 – trqJPfTrdDgqt5Pcrmcu
// 2021-12-23T20:58:22 – sIsEk9mZOmneiB0jXTj6
// 2022-01-09T18:05:07 – 5t8g5cyJhjLyxXz04bVm
// 2022-01-09T22:59:06 – VAxEP1IfSQTPk7NwwB1A
// 2022-01-24T11:38:00 – 3dbOrVKkpwpPa46iU2hh
// 2022-02-15T02:17:51 – p0mFvFovYG34PxYHZXbC
// 2022-03-12T16:26:58 – tbKPXtvjljueqJy2RP58
// 2022-03-22T05:29:56 – FrGsE77hW3BeCQFXDc5z
// 2022-04-17T14:17:03 – t6JAjOUAhuxcxtr6H2UZ
// 2022-05-08T22:34:42 – nnqfQjhtXZMawaRGYzNN
// 2022-05-20T18:18:14 – ncHSN03EBNwDg5mTxxUD
// 2022-05-29T10:52:50 – QcftmxuMlsAKNwsCbyx1
// 2022-06-27T06:25:56 – 5mJPfiTK5G4l0h08482u
// 2022-08-07T13:38:01 – nr8TIYJAL7gm815ovWEK
// 2022-08-20T11:22:18 – dpG4BnAc4fSHJCKGl5Si
// 2022-09-21T18:25:40 – 6I6nzRiEcsDCl2u6CXrX
// 2022-09-26T15:10:16 – i5AteshvzeSuuUuO0DFf
// 2022-09-30T09:31:17 – 9x4Pc1bGtpxVZMCWu3Hz
// 2022-10-01T04:20:55 – RGlN3wNuXVjv2xewTtht
// 2022-10-22T09:34:13 – dm2cgeamjkAEpOZuRwxV
// 2022-11-19T02:38:39 – PN13omfm5OU2SWUteane
// 2023-01-10T17:25:45 – 6j0gMvRDNrDdLY7432Fx
// 2023-02-02T07:32:47 – NKWurEQnSPmscPRbhdVx
// 2023-02-07T15:40:35 – Xk7kF3Ps6pe8gd4DhMia
// 2023-02-10T05:58:38 – GpIipm5kRvWvyekAC5H9
// 2023-03-25T17:32:02 – UpuopU2tsR5iIuSQiKAI
// 2023-04-30T15:50:11 – kuRV6jSaGaZDI7my7RNa
// 2023-05-04T04:33:45 – vXS84UVECdLcqCtccis0
// 2023-06-03T16:51:16 – teUw4kdb6uZcBxgsp4ug
// 2023-06-06T01:05:08 – 77RD2PmodQ0dg9aB9wI6
// 2023-06-23T23:32:40 – UxAQJTduYNs8KtHJh6FD
// 2023-06-25T02:07:14 – aYGJS7lVg7yVp8eBw0tk
// 2023-07-07T18:17:56 – 3WWm0bvDXCtimeRQm0vz
// 2023-07-22T06:49:01 – d3zX4jntDx4vlp7DsBvK
// 2023-08-01T10:27:04 – QHUEGxPVm1Ey0RmxRNnf
// 2023-08-14T16:37:40 – q1sbuYsmjd2zSZmFtmsi
// 2023-08-29T15:59:12 – mVkQdins46mZm0U3M9lI
// 2023-09-25T03:28:33 – emZWgMt1OILrWlJuhpGv
// 2023-09-27T21:26:16 – vVdmE3tDPxiP8J3cdPqn
// 2023-10-26T23:49:38 – W5ayL5QYpfDegX9Rxbtz
// 2023-11-03T16:40:10 – 48LKNoYY1IRrhCTJsXKj
// 2023-11-07T10:08:18 – om0BiaC4698RgtiBz1BA
// 2023-11-16T17:04:11 – v72j7Bxxs43kitH7sDrw
// 2023-12-19T17:34:11 – qFiFravNwRREJLCnY7rZ
// 2023-12-31T15:52:25 – kXAzKj9IkYPmHmT0kdor
// 2024-01-06T02:16:25 – RPzjXzlZzF8Api4p7Srp
// 2024-01-17T10:55:54 – R9XZLXMRmbiFvp2tcl7Y
// 2024-02-22T08:39:04 – lZ2uYcEeZX5QOxLNDmrh
// 2024-03-08T08:46:08 – VspzVROdDkeExdp1bB9M
// 2024-03-13T05:38:20 – K19PHu1DakAthy8HH7CN
// 2024-04-19T18:13:02 – nCpvad960YSPjIRLM4Og
// 2024-05-23T16:47:37 – rFbVEBF7TXGqmzdaX6C0
// 2024-06-02T04:35:25 – Qxqt0dVJkckjhGhdeMlj
// 2024-06-05T21:00:55 – naavnN5D3fAOh5l1nRde
// 2024-07-01T18:56:46 – TCE9wAJMKYdni8mRXCwx
// 2024-07-10T01:48:14 – 6KPrrxH4RbEL8XLZjOrg
// 2024-07-23T13:27:42 – kMERUvx1kLSMdxR6Hjyv
// 2024-07-29T02:42:56 – MwEcD0V90wL1I4fR1gUA
// 2024-08-06T18:12:40 – we7eW7HS6gyZZajUPKcp
// 2024-08-28T03:05:19 – 9ReqOvBbhUW5h2xeX573
// 2024-09-30T00:42:14 – xXgsORzolOjesOqZV7FZ
// 2024-10-28T16:58:30 – NNmoE8AvgZVgS4WsoI3Y
// 2024-11-19T10:34:15 – cHbbzyTjVhNfFVVSFChw
// 2024-11-30T19:55:57 – o7qVUpdWEqYZY6IzzOjT
// 2024-12-16T13:06:38 – v3Xpx5dxp6ynd57btFFl
// 2024-12-23T01:24:59 – Dxey91QiCUTN3e3cvCiP
