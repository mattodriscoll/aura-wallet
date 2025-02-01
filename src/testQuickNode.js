const web3 = require("@solana/web3.js");
(async () => {
  const solana = new web3.Connection("https://young-dark-moon.solana-mainnet.quiknode.pro/f1c690a673edfa0c1d03bceee62aa1a28758037f");
  console.log("Current slot:", await solana.getSlot());
})();