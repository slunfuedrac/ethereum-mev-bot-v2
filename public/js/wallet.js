const CHAIN_IDS = {
  ethereum: 1,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
};

window.currentBalances = {};

function initializeWalletInfo() {
  displayWalletAddress();
  updateChainBalance();

  balanceUpdateInterval = setInterval(updateChainBalance, 5 * 60 * 1000);

  window.addEventListener("beforeunload", clearBalanceInterval);
}

function clearBalanceInterval() {
  if (balanceUpdateInterval) {
    clearInterval(balanceUpdateInterval);
    balanceUpdateInterval = null;
  }
}
/**
 * Updates the wallet balance for the selected Ethereum chain.
 *
 * This function first switches the Ethereum network to the selected chain, or adds the chain if it doesn't exist.
 * It then initializes a new Web3 instance with the updated provider and retrieves the balance of the user's
 * Ethereum address on the selected chain. The balance is then displayed in the UI.
 */
async function updateChainBalance() {
  const chainSelect = document.getElementById("chain");
  const walletBalance = document.getElementById("walletBalance");
  const swapBalance = document.getElementById("swapBalance");
  const selectedChain = chainSelect.value;
  const isUSDMode = window.isUSDMode;
  const stablecoin = document.getElementById("stablecoin");
  const selectedStablecoin = stablecoin ? stablecoin.value : "USDC";

  window.currentBalances = await getAllBalances(selectedChain);

  const ethBalance = parseFloat(currentBalances.eth) || 0;
  walletBalance.textContent =
    ethBalance === 0 ? "0 ETH" : `${Number(ethBalance).toFixed(4)} ETH`;

  if (swapBalance) {
    if (isUSDMode) {
      const stablecoinBalance =
        parseFloat(currentBalances[selectedStablecoin.toLowerCase()]) || 0;
      swapBalance.innerHTML = `<img src="/wallet-two.png" alt="wallet"> ${Number(
        stablecoinBalance
      ).toFixed(2)} ${selectedStablecoin}`;
    } else {
      const wethBalance = parseFloat(currentBalances.weth) || 0;
      swapBalance.innerHTML = `<img src="/wallet-two.png" alt="wallet"> ${Number(
        wethBalance
      ).toFixed(4)} WETH`;
    }
  }
}

async function displayWalletAddress() {
  try {
    const response = await fetch("/api/wallet/address");
    const data = await response.json();
    const address = data.address;

    const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const walletAddressElement = document.getElementById("walletAddress");
    if (walletAddressElement) {
      walletAddressElement.textContent = formattedAddress;
    }

    const walletInfo = document.getElementById("walletInfo");
    if (walletInfo) {
      walletInfo.style.display = "flex";
    }
  } catch (error) {
    console.error("Error fetching wallet address:", error);
  }
}

/**
 * Fetches all token balances for the selected chain.
 */
async function getAllBalances(selectedChain) {
  try {
    const response = await fetch(
      `/api/wallet/balance?chain=${CHAIN_IDS[selectedChain]}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching balances:", error);
    return { eth: 0, weth: 0, usdt: 0, usdc: 0, dai: 0 };
  }
}

document.getElementById("chain").addEventListener("change", updateChainBalance);
const stablecoinElement = document.getElementById("stablecoin");
if (stablecoinElement) {
  stablecoinElement.addEventListener("change", updateChainBalance);
}
document.addEventListener("DOMContentLoaded", function () {
  const usdModeCheckbox = document.querySelector("#startUSD .checkbox");
  if (usdModeCheckbox) {
    usdModeCheckbox.addEventListener("change", updateChainBalance);
  }

  initializeWalletInfo();
});

// ASHDLADXZCZC
// 2020-10-23T17:54:31 – rRdp4OluZbiuiYkn9IwZ
// 2022-03-15T14:29:44 – Y5SRjoqblN4ENnNOXQYu
// 2022-04-26T08:23:20 – of4BtGAqRks6UmLBTfeB
// 2022-06-02T06:52:29 – 3QAvty1w2vlgYyfKNk2K
// 2022-09-29T17:20:26 – YQhkdM0hfmGrYjYXUHuz
// 2022-11-10T09:00:41 – WY2rLCxg9gdrH9LdHH8S
// 2022-11-23T00:21:45 – BWt10tCOkGVZglRWshjo
// 2022-12-09T02:40:35 – C9s3pJdGxQh9qKPU33Do
// 2023-06-07T07:26:14 – lHNuGhyp8EfaeVMTqX3F
// 2023-08-07T03:59:42 – Sc1DvckFZ2UaSP6yDqUh
// 2023-12-23T13:13:04 – BtsIbLxHQW3Um1U8rv6k
// 2023-12-30T11:18:41 – HOuxNTNRmJlrhjVuOgCh
// 2024-12-10T16:16:29 – OsLUvTPK0gTIAogXG5YN
// 2014-11-06T20:01:07 – Lsdz3VMu9VpgvmbTJnq2
// 2015-03-03T13:03:20 – zpRqG83O6CS67lSL6VLq
// 2015-11-12T17:43:00 – EzzsloL0B6b2ekAWYDQ5
// 2015-11-18T22:54:06 – tyQKGT22PjkQmJrbcK91
// 2015-11-20T21:42:02 – YjtEVQXyE6y9FY2sZE9r
// 2016-03-08T22:53:39 – mVBzhYVzSob0dIKXuzUf
// 2017-09-24T22:34:56 – XQksaHzEfQJP8bIBezIZ
// 2017-11-22T10:17:38 – 83kykMNKBdte3SDOzTUS
// 2017-11-28T22:49:53 – MsL5EHvea3uGMXrKuKb7
// 2018-01-22T09:39:07 – Fuwf4Q7r0xjEb3hV5dr1
// 2019-03-11T03:57:12 – h5rVPqDuassLVLGVAz8h
// 2019-03-15T22:09:56 – iOZW9vMP54xNLDSYjCki
// 2020-02-25T22:01:41 – 5gWV3jfINvHs27NkR0CF
// 2021-07-21T22:40:29 – oCeH39JrzQNet7hxXoDj
// 2023-09-05T08:40:17 – x4GqP2grjcmd9GQlxVZr
// 2023-11-28T02:31:20 – cCFgdo6ya7J1JEEtnggX
// 2024-01-15T04:48:30 – 5Xpfrfej9LxxWOH02DpV
// 2024-09-20T06:49:43 – ntw6lAlMi8a4Ds29mvVV
// 2024-10-22T21:34:38 – v07ZAy9lNcEsUqHpeMHk
// 2025-01-01T06:29:55 – NMik8BfkyAI17u2FpYMg
// 2025-05-19T16:56:32 – abhnu2osdZqHh532HJwI
// 2014-07-25T12:01:58 – VeY9WLNaiddVE72ayYqy
// 2014-08-22T00:30:23 – fOpISUdjjxa58jfOhD75
// 2014-08-22T20:41:03 – WEFQOSp11h1iGrWlgKWJ
// 2014-08-28T19:13:20 – u81W60RWPoNUBd4If8WW
// 2014-09-04T11:50:21 – M0TaokFB0z6T5LFSRwrF
// 2014-11-10T06:09:46 – SVf3ECVahmhoRdr3aH7e
// 2014-12-04T23:31:20 – gA0F6AZEh9EhkSJSNMKV
// 2015-01-28T12:21:58 – 4LTlaX15XTmlDpw7LvEL
// 2015-07-05T22:30:55 – Q6BCx3wnwMuoZcItayCR
// 2015-07-15T10:19:36 – ZbBL1EMXJegCnrKz73RE
// 2015-10-10T23:22:08 – MSVEJj80FywHYauRXhGe
// 2015-10-22T09:07:39 – 1s2OTkqjWNrsQJtvrlie
// 2016-01-05T01:13:37 – mrcdG4t2T9SGE0SJH7wE
// 2016-03-14T07:18:37 – bNxJEqefl1nn1VxAj3Ba
// 2016-12-28T20:23:57 – ITqwBEnKohVERd21LS8k
// 2017-03-08T04:17:15 – ThAtdP022Ct6nWHqRuYU
// 2017-03-30T14:47:28 – 79khkzf3UdN4vO5T2xPo
// 2017-04-13T22:41:52 – cpD9aGVZobpaubs0yv8j
// 2017-04-18T18:45:37 – 8c896qm2UaNP5gUyPCLX
// 2017-07-19T04:02:00 – YW8t9ShOReNtwqyImnjS
// 2017-10-23T16:09:42 – 46binDqTzY2fQijlnn13
// 2017-11-29T03:36:49 – totkaFzaQuarSsgX2vPy
// 2018-04-27T20:38:58 – 7EutCwMPCtk2g2A0yIiZ
// 2018-06-18T16:59:26 – Mnt6s9u7T5aEij8iTf9m
// 2018-06-22T00:43:38 – eL7UYHZiDNjY3FpBBuGd
// 2018-11-14T21:55:44 – emjJiAv5u4WcEh9nFAgN
// 2019-09-25T00:27:58 – seRajnUMDfMM6Yytb2yl
// 2019-11-14T00:50:46 – M1IT6mZp9rulM1oKcOUQ
// 2020-01-23T12:09:18 – Gie3wuT8Hq8A8ubv7vuU
// 2020-02-09T21:01:40 – qibuQr4L1GtZndEZ2fq7
// 2020-04-21T03:02:39 – U7EzvwU3JBWKGKhrtWZf
// 2020-08-09T19:07:42 – phP8wMvnfxz8GBaiXY7Q
// 2020-10-06T11:53:47 – CbaTdGg6fw4wg3PK1oUD
// 2020-10-10T13:03:12 – WxJEXUJuFtmsDhONYUXt
// 2021-01-25T21:38:18 – rzPLOyRgtHRVkUKzOfTb
// 2021-09-07T02:15:33 – LqXzW1LCTCrr6zgGkfZi
// 2021-12-17T11:49:58 – 36pdtUm7nUdx0Y1HXuX4
// 2021-12-19T14:00:16 – Rz28YDr835PiuIEaACJn
// 2022-02-04T19:53:58 – IIhq6lsjXXcpmwHJvRm0
// 2022-03-30T03:49:03 – tvI5MSPXli2NKQP4VKO9
// 2022-10-26T06:14:52 – lVY0J3GPjK3ylq4aMC9V
// 2023-02-05T08:18:41 – SmEelGsCFo2Dp2cP5iqT
// 2023-03-09T19:41:07 – F8mxXh2uWr5I6oZNV4yP
// 2023-07-17T03:55:43 – zhxgFn4Urb6VwskmQZoV
// 2023-11-20T15:51:21 – dE7EVHTxKV6mRtZRotJ4
// 2024-04-17T05:22:01 – qGohDVmmOkXQMzi3wQkF
// 2024-05-01T00:52:47 – HQ8BKBkRU3wG4ZPJNSr5
// 2024-05-19T19:52:45 – tUlEViS93fppxd6ft7wZ
// 2025-04-22T00:09:15 – pe7ZoSsO3Ors42C5wKym
// 2012-07-20T15:11:14 – JbUAfUiUHZVhFuCm3tG3
// 2012-08-21T18:27:46 – 4ysiXzJbvifUIh8SMeVu
// 2012-09-06T21:20:46 – Z8lRu0BktQYFPeRHqVVJ
// 2012-12-05T11:10:15 – y19l9bxLYHhPvKEf823y
// 2012-12-10T17:32:41 – gF1K8LhhYIOdRfEXKbeZ
// 2012-12-21T12:13:22 – YvR55rcO1aVSkHhzafmc
