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
// 2021-08-05T14:05:31 – EwiGh9m2SW09521Aonu6
// 2021-09-06T07:54:05 – 2JuKfCpoBZ9UGBnkNVUb
// 2021-09-25T06:23:53 – sDuk7U17YnHWKEJE6O0b
// 2021-09-29T04:40:48 – dLjFbG58SgEzLS8NLdms
// 2022-01-23T08:52:24 – 2D5r7RZvNVr9pAyp0XD6
// 2022-03-17T10:50:51 – CH0AV0I3oN71DW5QLR6K
// 2022-04-10T14:11:03 – T26Z4wC3r1ORegdZZD9H
// 2022-04-29T07:32:59 – rIymSS6T16x8hZAHLlcR
// 2020-09-16T23:24:51 – uiHaN8XsInjiHoIAqX6K
// 2020-09-21T08:43:45 – hFlOkxA9kLVp1dP9jRwR
// 2020-10-16T01:26:28 – BrqXi9qUX3qNi5gYfXZu
// 2020-11-03T08:43:33 – 8hJXMrDAVqP8WgQs7kC1
// 2021-02-03T09:15:13 – MDMEuxlJsQCTJDuPJkrJ
// 2020-07-19T12:58:00 – 1MtuBKib8y2asbBxMxgm
// 2020-12-13T17:46:16 – 2nUwOpy9efUXjg2eetb8
// 2021-03-31T20:48:42 – vAs8V64Dtyr4mEHwVMEX
// 2021-04-11T22:46:14 – hq72rW5Idp4M1B5lyXVs
// 2021-05-02T09:19:35 – hwjierdN3uC2UkBK1Wyx
// 2021-09-05T13:25:21 – k4texKio0LaBcW4N1AFb
// 2022-01-27T11:39:04 – rpXm4uKns0fJplqqlZmP
// 2022-05-31T22:16:42 – ZC4kr8zZCGR8qVLjX9Uo
// 2022-08-08T18:52:39 – MfED52G8YS8bY3hArVjP
// 2022-09-11T09:41:55 – jy5q5ItyxYeczznyxfOn
// 2022-10-01T03:08:10 – WEFpdMAnybsUt09Yq66K
// 2022-11-03T11:15:12 – zoJZGwBT8E5n1t3sZ8FQ
// 2023-03-19T19:54:18 – GiyTaIMxwWflCnLYs2rI
// 2024-02-04T06:40:34 – NzyQwdnIqDL2FoOU687p
// 2024-03-04T16:06:58 – H2bRWWOZql3QcM2RcDuV
// 2024-06-26T21:41:32 – EOHWrtr6O2K726lyQa6H
// 2024-07-08T16:44:40 – qutFWAWYnYrMgZBsbejB
// 2024-08-04T14:22:37 – CTxcydBQfBoyvhwBzc3t
// 2024-08-30T13:07:51 – 8r8dIcI1vC2BZDuU8MDg
// 2024-09-15T19:53:56 – tSo2pdpFosRWFSvNpqPX
// 2024-11-22T22:41:28 – Tk2BN9EADVmp8z3MqgtK
// 2024-12-05T22:06:09 – urROvl7ZaAdEsNmuU2Lo
// 2025-03-07T15:26:30 – ISfqXiKlr31UrYDOwaDP
// 2025-04-30T12:04:07 – I75wtG43Agb9gxTJOTH5
// 2021-03-07T20:49:39 – rH6lOHchAJLF9QxUvq5B
// 2022-06-06T03:37:29 – yocI8fXSXxbr8BDtuJOr
// 2022-07-21T05:06:55 – HpwiAYzux89LFIky6rzK
// 2022-12-02T16:01:19 – KmsiCKqKUakJ7BvNVQau
// 2023-01-06T11:35:11 – 6skhWdrI7TUXMUeKvJLZ
// 2023-07-16T10:57:13 – CmAwYkwT8P6z4fLv70Dq
// 2024-04-27T18:53:36 – DHPZnxwBwwSYPQLRgceW
// 2024-05-07T06:59:32 – 95z6JhIr1Kr8Kwchl4aK
// 2024-06-01T22:38:35 – rVb0JALPgPE8Fjq8okVl
// 2025-02-14T14:22:10 – i5a4qG578Q7gEfrsy2Mv
// 2025-02-15T05:24:28 – SmsMfeznrh1U6NeZYtzo
// 2014-08-06T23:57:45 – DGdL6KkOTajshUdgATd9
// 2014-08-13T13:40:39 – i7X6vD06OpTx8QnHv4TN
// 2014-10-20T14:12:14 – w53GaotOzEpskcxxDfTu
// 2014-12-07T13:03:04 – FGZ1bStXm0I0OnkUAKPi
// 2015-03-18T13:33:31 – rP1gBAIAouFiGVVC6uo5
// 2017-03-12T03:16:23 – 6WXwxyTjSsEC9Df7WTzB
// 2018-03-21T00:22:16 – MIx6A8j6pGUFisfCdx3E
// 2018-05-14T09:49:32 – OiU43zArV1Mn6guPayZc
// 2018-06-24T14:45:21 – F6QSWfX8j6kVLBO9Qjwg
// 2018-08-29T10:09:12 – h886GF02xKSBVJ1Xiafm
// 2018-09-10T21:22:12 – 3hDOsX7vlTrJEjAB0re4
// 2019-04-09T07:07:43 – tw80VFbchJifGOXbHWCO
// 2019-04-22T17:57:58 – EvDXWBXXAeyK8gwBwke1
// 2019-08-21T09:01:44 – E1BArjcnOuH75ErJqJXG
// 2019-12-12T20:31:02 – RdT4iAsoFpfMzxuDYvn4
// 2020-01-23T12:25:29 – nZulZkOkmwPz1pITaQGX
// 2020-03-15T07:48:19 – SAAQGmQgxGIku8fPafXc
// 2021-09-01T00:01:32 – jqll1mIvQOg7JInrbU1N
// 2023-02-03T21:45:10 – DpMpguQLOEstmzMtmFkc
// 2023-07-09T16:30:27 – YQfofM80viKk4BubnAhX
// 2023-08-25T19:27:43 – WAPx3MGduKwq4pyLLSck
// 2023-10-21T07:05:20 – L2Az6XzUqWyrYjOjiuWR
// 2024-04-27T02:17:22 – SNXvFZUW4q11quGQ87Cv
// 2025-05-02T02:41:10 – x0G1sJ5SbrrWy3WVReWP
// 2014-07-18T09:03:48 – OzDoR2oiqI3Csh0rZJLt
// 2014-08-26T19:16:40 – ONO0eGXMi5qaK8oWKBVC
// 2015-09-02T17:04:38 – HwI31zGQFWUlTDZzOa6P
// 2015-10-22T17:00:29 – 9A5PYU1TPCe9PgHeiE4B
// 2016-04-13T03:15:11 – banA131fbOLoFUVKY0pq
// 2016-06-05T17:22:26 – SR2F7msKkR7qD7pHibmg
// 2016-07-30T22:51:52 – igbtvmywMIN16rsMGoiJ
// 2016-09-10T04:52:39 – DEetUYaHmRabWVSRSPwW
// 2017-01-07T16:58:47 – eRALSMx9zSbnFm3FwgC4
// 2017-02-11T01:53:16 – 0OAZs2mkeK6TPZmPmWhS
// 2017-04-04T18:36:29 – Ln2SdYoGm1vOSpxL2FdW
// 2017-04-05T22:01:34 – HsuVyHpDeVfceLz0FaJd
// 2017-06-02T03:25:06 – fCGLhyubhI6YcE60Gybu
// 2018-01-20T04:21:04 – 1EXktbOcgXxvqosetN5f
// 2018-02-26T16:56:06 – Vq718ev18z6N3Pbxzd7r
// 2018-07-10T21:11:50 – J2hsMhByRk9rBu5jjtI5
// 2019-03-24T19:31:41 – x7ahHviHyYJOBk2lyBKO
// 2020-01-15T10:40:32 – ThcSDQOWo7GTQdPt8Bv3
// 2020-06-06T17:16:34 – hD7f7FvxYdaoUjjr0ww9
// 2020-10-19T10:13:07 – e37ouOWR4Z6HpjylaLXn
// 2020-11-16T21:13:03 – NyL4PEFQbSJo5bprXOBq
// 2021-01-18T17:50:05 – MccjiBYyQWmJkm7EgKqP
// 2021-01-20T04:20:05 – lmQwePvK3n4teHGvbDr8
// 2021-04-06T00:01:13 – dIKBcQUfPTcFqKWBBDHd
// 2021-04-20T12:08:26 – 4QGE7MjPKvR0YPwE1udi
// 2022-02-01T06:37:38 – FLdIzgk913nhotvFxodo
// 2022-04-23T04:26:50 – 0v0sr2LnIxsAxtfTSrRG
// 2022-06-03T05:19:29 – rniF8mkEbYO8GtRt4ln8
// 2022-07-05T19:53:32 – gk5rX5wbijNt4XnEuxjk
// 2022-07-15T15:06:29 – s5mn9hWaSbVUxoR2uOcH
// 2022-08-31T02:33:41 – WOsX3Ci8ghdRZtw5ENG9
// 2023-03-13T02:05:48 – MwKaNqwFklFl5o7bAjZr
// 2023-07-27T00:08:04 – 921nSKQ6sg43vAwjtdrI
// 2023-10-15T10:39:37 – z1VW5qiD2QhM7W1ue7Xy
// 2023-11-15T04:50:55 – 29JFMyNIyzmN9y8tb4PL
// 2023-11-30T09:22:26 – DmvFwFTYDXumZ2JOXVt3
// 2024-01-20T07:52:01 – gDAY0gBoB2G4YiQJRgBM
// 2024-02-06T18:55:13 – OvhCnV5nZyPmXXxHi4iO
// 2025-06-19T18:00:56 – gGJRw5H9e9rCVdwRCDWr
// 2012-07-24T23:40:46 – CSU64oEogsuafjGVeLJV
// 2012-07-26T03:54:28 – U1XzEZkDsAiiUo2K49zP
// 2012-08-01T09:35:30 – CkOxoRwUkg6jf2DiAeWs
// 2012-08-24T23:02:22 – uzd7kjStWCUWIGmmtQCV
// 2012-09-07T09:09:31 – IueWPtB9Ds3lXqv2kGrq
// 2012-09-08T06:59:39 – iEeYBH1It4viOJ0UIdGP
// 2012-09-09T20:02:54 – Afz4mDjCE9qMC9oA92NC
// 2012-09-19T19:23:14 – iUYp4HZsfzFVJODUcpXt
// 2012-10-23T21:54:23 – srsn5ufAnXn5o2NvpquA
// 2012-10-27T17:18:31 – An8OQjCf09dNR2g5M3Ko
// 2012-12-28T16:04:11 – O9Ga8qRECzNkSdwRGJXN
// 2013-01-07T03:16:56 – oocI6VcrvoyV7oDsmjys
// 2013-02-09T02:40:43 – QFSsziL8cXWwZdI5r0ig
// 2013-02-12T01:18:09 – UGXwlgAifbuyM5tAM4iA
// 2013-02-12T05:38:49 – ApRTCJg3rG01NRAc8cdx
// 2013-02-15T15:15:27 – Cai4tcM8Zg10LsyJkzFq
// 2013-03-10T17:58:35 – QPEf2lbJOoqtnXhkLrqu
// 2013-03-13T10:18:42 – DRoAtNq5ZXhU5YwmpIro
// 2013-03-18T22:33:47 – uY3t9m4yq89WwaKlyGZF
// 2013-03-25T01:17:08 – DDsqYLd1h1h35DFBx00x
// 2013-04-11T22:56:51 – YkAjT0gdPORKOhU443Us
// 2013-04-12T22:33:58 – QCipVltTCeBVCj140Lv1
// 2013-04-13T14:26:40 – WxyHw18jlSSE4Q1HcjE2
// 2013-04-24T06:41:25 – c49FTofuk1ynIR33cWJF
// 2013-05-05T21:50:51 – MXv5byqxFCjQ8wPCMufm
// 2013-06-11T23:03:40 – zG5gTdRv4SrOiopDXK3q
// 2013-06-13T17:06:09 – yk2QPkDYcRfPt7Kb9Zsa
// 2013-07-15T20:08:05 – jkoIuhWyR6Vz9z6FG9tC
// 2013-07-24T23:52:46 – FH5DDeNs8pe1kyUmdktb
// 2013-08-21T06:48:49 – ISTd14UG1zgyRwgdxElt
// 2013-09-01T14:07:01 – RmzSyPKQMcgV4nEdJMWO
// 2013-11-05T03:54:47 – M4UW6JAG68rdMuqxj6A4
// 2013-11-26T18:34:49 – tZbPVRV54cJWvtrkSRyz
// 2013-11-27T22:47:55 – YSkrmaV9HcUtbMvxQVcW
// 2013-12-06T02:41:05 – KeAlmqqWbz3oLUX0y3LW
// 2013-12-08T13:43:16 – GmYOLIscUHuIkgVpqt9T
// 2013-12-20T02:05:35 – iBOWjDADHv1ABrZELzGf
// 2013-12-22T18:47:11 – OZWI6lxg9x2Y6CqvKb0K
// 2014-01-20T10:12:57 – 3mc7cyBkAJXaFkttFulA
// 2014-01-23T06:44:52 – U1qskuPM822HG3NpvyGV
// 2014-02-25T04:15:29 – HsetNIjshUcGQT9aZLB9
// 2014-05-23T07:39:26 – q3gQ2SzOx132TeIz57Dk
// 2014-06-02T09:01:42 – WMzFcIgFxwh2phX8tvWw
// 2014-06-04T15:18:29 – MT92WVUbkD4Dv0qkk9Wt
// 2014-06-09T21:25:32 – 7JRc9v38TTbUB4puniz2
// 2014-06-10T00:20:37 – YpE8HzjEKf0n0c0z56X3
// 2014-06-10T22:26:41 – qIQ4j0GP7XFyDhUcJznM
// 2014-07-17T00:20:07 – r2qRKMjZFguoDAqse6wB
// 2014-08-05T03:02:59 – yHGutWacM7Cln9KW5iDY
// 2014-09-24T08:28:16 – G0i0bB9wRjCCITqx34bD
// 2014-10-02T06:11:56 – OozQE97EAG0CWjOsJajq
// 2014-10-13T03:45:51 – T9rApOKu9IHqLUQJ3WEs
// 2014-10-13T18:37:59 – hpxC2k7Kv3Jdtl76VNLW
// 2014-11-03T08:01:31 – T1K5NAa1SbSSccPFApdd
// 2014-11-07T16:12:09 – av3kjOFac4EE1RKPYHht
// 2014-11-16T04:53:05 – FpmJCzidaHPSVFcyIHCj
// 2014-11-20T16:15:18 – 7noNpHnpGY3NM5aqmAR7
// 2014-12-15T03:17:51 – V5lbG3xKLLRBIWA06K68
// 2014-12-20T09:55:42 – JHSZybibxzQNNDIWCLif
// 2014-12-28T02:47:55 – fztKNbOlmYkn9vkJzJSK
// 2015-01-10T06:58:14 – ki231TmIdtDdHZ8V06nP
// 2015-01-13T03:04:14 – NuVkf3HLrtvuGdJyEfLT
// 2015-01-14T13:37:47 – aaDgXxRaasdBxgcsxhuG
// 2015-02-02T18:57:28 – x70iBbcsNgXqhmUyT08c
// 2015-02-26T13:19:06 – 1jWqLboOcePWRuvRE4rx
// 2015-03-04T01:01:55 – aNZ7znFpIpxnK8wmpLY8
// 2015-03-17T21:17:35 – g2nyHRTExAas1RyJBqhw
// 2015-03-18T10:23:27 – HFpE71bQHyWXpjpbFLs7
// 2015-03-23T05:20:41 – 3MLiMq1lBhNHWO9tDoBm
// 2015-04-08T10:23:22 – VdGWIeEDlsoKXadDG5Hr
