// External API price
const ethers = require("ethers");
const fs = require("fs");
const axios = require("axios");

console.log("Starting up price script");
require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const tokenABI = require(cfg.token_abi);
const factoryABI = require(cfg.factory_abi);
const pairsABI = require(cfg.pairs_abi);
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let dexes = cfg.dexs;
let all_tokens = cfg.tokens;

const prices_filename = "data/token_price" + cfg.xpid + ".json";

console.log(all_tokens);

function newElement(token, usdPrice) {
  return {
    token: token,
    usdPrice: usdPrice
  };
}

function getUSDPrice(tokenSymbol) {
  let token_price = JSON.parse(fs.readFileSync(prices_filename));
  let usd_price = 1;
  try {
    var price_line = token_price.filter((i) => i.token === tokenSymbol);
    if (price_line[0].usdPrice) {
      usd_price = price_line[0].usdPrice;
    } else {
      console.log("no price:", price_line);
    }
  } catch (err) {
    console.log("error getting price");
    usd_price = "NA";
  }
  return usd_price;
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
      prices_filename,
      JSON.stringify(pricelist, undefined, 4),
      "utf8"
    );
  });
}

if (require.main === module) {
  mainPrice();
}

//exports.token_address = token_address;
module.exports = {
  mainPrice,
  prices_filename,
  getPrice: getPrice,
  getUSDPrice: getUSDPrice
};
