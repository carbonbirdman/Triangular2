// deprecated
//Check pairs for liquidity
const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const routerABI = require("../src/router.json");
const fs = require("fs");
const axios = require("axios");
const solidRouterABI = require("../src/solidRouter.json");
const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = dx.router_address;

//let tokens = Object.keys(token_address);
//var dexes = Object.keys(factory_address);
let tokens = cfg.tokens;
let dexes = cfg.dexs;

let pairs = JSON.parse(fs.readFileSync("data/all_pairs.json"));

function newElement(dex, token0, token1, pair_address, reserves0, reserves1) {
  return {
    dex: dex,
    token0: token0,
    token1: token1,
    pair_address: pair_address,
    reserves0: reserves0,
    reserves1: reserves1
  };
}

function getUSDPrice(tokenSymbol) {
  let token_price = JSON.parse(fs.readFileSync("data/token_price.json"));
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
  }
  return usd_price;
}

function getRouter(dex) {
  if (dex === "solid") {
    return new ethers.Contract(router_address[dex], solidRouterABI, conn);
  } else {
    return new ethers.Contract(router_address[dex], routerABI, conn);
  } //else
} //getRouter

function getRoute(dex, add0, add1) {
  if (dex === "solid") {
    return [
      {
        from: add0,
        to: add1,
        stable: false
      }
    ];
  } else {
    return [add0, add1];
  } //else
} //getRouter

function getLiquidty(pair) {
  let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
  let reserves_data = JSON.parse(fs.readFileSync("data/reserves.json"));
  var token0_usd_price = 1;
  var token1_usd_price = 1;
  try {
    token0_usd_price = getUSDPrice(pair.token0);
    token1_usd_price = getUSDPrice(pair.token1);
    const [token0, token1] = [pair.token0, pair.token1];
    const token0_data = token_data.filter((i) => i.symbol === pair.token0);
    const token1_data = token_data.filter((i) => i.symbol === pair.token1);
    var reserves = reserves_data.filter(
      (i) => i.pair_address === pair.pair_address
    );
    console.log(reserves);
    var token0_reserves = reserves[0].reserves0;
    var token1_reserves = reserves[0].reserves1;
    const token0_decimal = token0_data[0].decimal;
    const token1_decimal = token1_data[0].decimal;
    console.log("re", token0_reserves, token0_decimal, token1_decimal);
    console.log(ethers.utils.formatUnits(token0_reserves, token0_decimal));
    console.log(ethers.utils.formatUnits(token1_reserves, token1_decimal));
    var pair_liquidty =
      ethers.utils.formatUnits(token0_reserves, token0_decimal) *
        token0_usd_price +
      ethers.utils.formatUnits(token1_reserves, token1_decimal) *
        token1_usd_price;
  } catch (err) {
    console.log(err);
  }

  return {
    dex: pair.dex,
    token0: pair.token0,
    token1: pair.token1,
    pair_address: pair.pair_address,
    reserves0: token0_reserves,
    reserves1: token1_reserves,
    price0: token0_usd_price,
    price1: token1_usd_price,
    liquidity: pair_liquidty
  };
} //simulate

async function getAllLiquidty(pairs) {
  var pairArray = [];
  var i = 0;
  for (const pair of pairs) {
    i = i + 1;
    try {
      let liq_data = await getLiquidty(pair);
      console.log("pair", pair);
      // Save data
      pairArray.push(liq_data);
    } catch (err) {
      console.log(i);
      console.log("Problem getting");
      console.log("pair", pair);
      console.log(err);
    }
  } //for
  return pairArray;
} //function

async function main() {
  getAllLiquidty(pairs).then((allpairs) => {
    //console.log(allpairs);
    let pair_string = JSON.stringify(allpairs, undefined, 4);
    fs.writeFileSync("data/pair_liquidity.json", pair_string, "utf8");
    //console.log(allpairs);
  });
}

if (require.main === module) {
  main();
}
