const ethers = require("ethers");

const factoryABI = require("../src/factory.json");

console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const routerABI = require("../src/router.json");
const fs = require("fs");
const axios = require("axios");

const cfg = require("./config");
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;

const prices = require("../scripts/prices");

//let tokens = Object.keys(token_address);
//var dexes = Object.keys(factory_address);
let tokens = cfg.tokens;
let dexes = cfg.dexs;

let pairs = JSON.parse(fs.readFileSync("data/all_pairs.json"));

function newElement(
  dex,
  token0,
  token1,
  pair_address,
  reserves0,
  reserves1,
  price0,
  price1,
  dollars
) {
  return {
    dex: dex,
    token0: token0,
    token1: token1,
    pair_address: ethers.utils.getAddress(pair_address),
    reserves0: reserves0,
    reserves1: reserves1,
    price0: price0,
    price1: price1,
    dollars: dollars
  };
}

function reservePrices(pair) {
  // get price based on reserves.
  let price0 = prices.getUSDPrice(pair.token0);
  let price1 = prices.getUSDPrice(pair.token1);
  let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
  const token0_data = token_data.filter((i) => i.symbol === pair.token0);
  const token1_data = token_data.filter((i) => i.symbol === pair.token1);
  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;

  let ntoken0 = ethers.utils.formatUnits(pair.reserves0, token0_decimal);
  let ntoken1 = ethers.utils.formatUnits(pair.reserves1, token1_decimal);
  let dollars0 = 0;
  let dollars1 = 0;
  console.log(ntoken0, ntoken1);

  if (price1 === "NA") {
    dollars0 = ntoken0 * price0;
    dollars1 = dollars0;
    price1 = dollars1 / ntoken1;
  } else if (price0 === "NA") {
    dollars1 = ntoken1 * price1;
    dollars0 = dollars1;
    price0 = dollars0 / ntoken0;
  } else {
    dollars0 = ntoken0 * price0;
    dollars1 = ntoken1 * price1;
  }
  return {
    dex: pair.dex,
    token0: pair.token0,
    token1: pair.token1,
    price0: price0,
    price1: price1,
    dollars: dollars0 + dollars1
  };
}

async function getReserves() {
  var pairArray = [];
  for (const pair of pairs) {
    let reserves0 = 0;
    let reserves1 = 0;

    try {
      let pairContract = new ethers.Contract(pair.pair_address, pairABI, conn);
      let reserves = await pairContract.getReserves();
      [reserves0, reserves1] = [reserves[0].toString(), reserves[1].toString()];
      console.log(pair.token0, pair.token1, reserves0, reserves1);
    } catch (err) {
      console.log("Problem getting reserves");
      console.log(err);
    }
    let pair_reserves = {
      dex: pair.dex,
      token0: pair.token0,
      token1: pair.token1,
      pair_address: ethers.utils.getAddress(pair.pair_address),
      reserves0: reserves0,
      reserves1: reserves1
    };
    let pair_prices = reservePrices(pair_reserves);
    // Save data
    pairArray.push(
      newElement(
        pair.dex,
        pair.token0,
        pair.token1,
        pair.pair_address,
        pair_prices.reserves0,
        pair_prices.reserves1,
        pair_prices.price0,
        pair_prices.price1,
        pair_prices.dollars
      )
    );
  } //for
  return pairArray;
} //function

async function main() {
  getReserves().then((allpairs) => {
    //console.log(allpairs);
    let pair_string = JSON.stringify(allpairs, undefined, 4);
    fs.writeFileSync("data/reserves.json", pair_string, "utf8");
  });
}

main();
