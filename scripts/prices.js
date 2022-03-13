// External API price
const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
console.log("Starting up");
const dx = require("../src/dexes");
const fs = require("fs");
const axios = require("axios");

const cfg = require("./config");
let token_address = cfg.token_address;

//token_address = dx.token_address;
var all_tokens = Object.keys(token_address);
console.log(all_tokens);

function newElement(token, usdPrice) {
  return {
    token: token,
    usdPrice: usdPrice
  };
}

async function getPrice(tokenlist) {
  var tokenArray = [];
  for (const token of tokenlist) {
    let usdPrice = "NA";
    try {
      const cg_url =
        "https://api.coingecko.com/api/v3/simple/token_price/fantom?contract_addresses=" +
        token_address[token] +
        "&vs_currencies=usd";
      const res = await axios.get(cg_url);
      if (res) {
        console.log(res.data);
        usdPrice = res.data[token_address[token].toLowerCase()].usd;
        console.log("Price", usdPrice);
      } //if
    } catch (err) {
      console.log("Problem getting prices");
      console.log(err);
    } //try
    // Save data
    tokenArray.push(newElement(token, usdPrice));
  } //for
  return tokenArray;
} //function getPrice

async function mainPrice() {
  getPrice(all_tokens).then((pricelist) => {
    fs.writeFileSync(
      "data/token_price.json",
      JSON.stringify(pricelist),
      "utf8"
    );
  });
}

if (require.main === module) {
  mainPrice();
}
