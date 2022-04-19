//Check pairs for liquidity
const ethers = require("ethers");
const fs = require("fs");
const axios = require("axios");

require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

console.log("Starting up validate pairs");
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const tokenABI = require(cfg.token_abi);
const factoryABI = require(cfg.factory_abi);
const solidFactoryABI = require(cfg.solid_factory_abi);
const solidRouterABI = require(cfg.solid_router_abi);
const pairsABI = require(cfg.pairs_abi);
const routerABI = require(cfg.router_abi);
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = cfg.router_address;
let dexes = cfg.dexs;
let tokens = cfg.tokens;

const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
const reserves_filename = "data/reserves" + cfg.xpid + ".json";
const tokens_filename = "data/tokens" + cfg.xpid + ".json";
const tradeable_pairs_filename = "data/tradeable_pairs" + cfg.xpid + ".json";
const validated_pairs_filename = "data/validated_pairs" + cfg.xpid + ".json";
const shortlist_filename = "data/shortlist" + cfg.xpid + ".json";
//////////////////////////////

const prices = require("../scripts/prices");

let pairs = JSON.parse(fs.readFileSync(pairs_filename));
let reserves = JSON.parse(fs.readFileSync(reserves_filename));

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
  let token_price = JSON.parse(fs.readFileSync(prices.prices_filename));
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
  //if (usd_price == "NA") {
  //  usd_price = 1.0;
  // }
  return usd_price;
}

function getReserveData(pair) {
  let match_pair = reserves.filter(function (element) {
    return (
      element.dex === pair.dex &&
      ((element.token0 === pair.token0 && element.token1 === pair.token1) ||
        (element.token0 === pair.token1 && element.token1 === pair.token0))
    ); //return
  });
  return match_pair[0];
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

async function simulateTrade(pair, input_dollars = "1") {
  console.log("Simulate trade for pair ...");
  let token_data = JSON.parse(fs.readFileSync(tokens_filename));
  var input_tokens = 0;
  var input_wei = 0;
  var output_wei = 0;
  var output_tokens = 0;
  var output_dollars = "NA";
  var token0_usd_price = 1;
  var token1_usd_price = 1;
  token0_usd_price = prices.getUSDPrice(pair.token0);
  token1_usd_price = prices.getUSDPrice(pair.token1);

  if (token0_usd_price === "NA" || token1_usd_price === "NA") {
    let reserve_pair = getReserveData(pair);
    console.log(reserve_pair);
    token0_usd_price = reserve_pair.price0;
    token1_usd_price = reserve_pair.price1;
  }

  console.log(token0_usd_price);
  console.log(token1_usd_price);

  const [token0, token1] = [pair.token0, pair.token1];
  const token0_data = token_data.filter((i) => i.symbol === pair.token0);
  const token1_data = token_data.filter((i) => i.symbol === pair.token1);

  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;

  input_tokens = input_dollars / token0_usd_price;
  //input_tokens = input_tokens.toFixed(token0_decimal);
  console.log(
    input_tokens,
    token0,
    "for $",
    input_dollars,
    "at $",
    token0_usd_price
  );
  const input_fixed = input_tokens.toFixed(token0_decimal);
  const router_contract = getRouter(pair.dex);

  try {
    let token_address0 = ethers.utils.getAddress(token_address[token0]);
    let token_address1 = ethers.utils.getAddress(token_address[token1]);

    let route = getRoute(pair.dex, token_address0, token_address1);
    input_wei = ethers.utils.parseUnits(input_fixed, token0_decimal);
    console.log("wei in", input_wei);

    const amount_out_a = await router_contract.getAmountsOut(input_wei, route);
    let [amount_in_token0, amount_out_token1] = amount_out_a;

    output_wei = amount_out_token1;
    console.log("wei out:", output_wei);
    output_tokens = ethers.utils.formatUnits(output_wei, token1_decimal);
    console.log(
      "First sale",
      input_fixed,
      token0,
      output_tokens,
      token1,
      pair.dex
    );
    output_dollars = (output_tokens * token1_usd_price).toString();

    if (token1_usd_price === "NA" || token0_usd_price === "NA") {
      output_dollars = input_dollars + 0.1;
    }

    console.log(
      input_dollars +
      "->" +
      output_dollars + //.toPrecision(3) +
        "(" +
        pair.token0 +
        "," +
        pair.token1 +
        "," +
        pair.dex +
        ")"
    );
  } catch (err) {
    console.log("trade error:", token0, token1);
    console.log("input", input_tokens);
    console.log("First sale", token0, token1, pair.dex);
    console.log(token_address[token0], token_address[token1]);
    console.log(err);
    output_dollars = "NA";
  }

  return { input_tokens, output_tokens, input_dollars, output_dollars };
} //simulate

async function getTrades(pairs) {
  var pairArray = [];
  var i = 0;
  for (const pair of pairs) {
    i = i + 1;
    // if check_exists then continue
    try {
      let trade_data = await simulateTrade(pair, "100");
      console.log("trade", trade_data);
      console.log("pair", pair);
      // Save data
      pairArray.push(
        //newElement({
        {
          dex: pair.dex,
          token0: pair.token0,
          token1: pair.token1,
          pair_address: pair.pair_address,
          input_tokens: trade_data.input_tokens,
          output_tokens: trade_data.output_tokens,
          input_dollars: trade_data.input_dollars,
          output_dollars: trade_data.output_dollars
        }
      );
    } catch (err) {
      console.log(i);
      console.log("Problem getting trade");
      console.log("pair", pair);
      console.log(err);
    }
  } //for
  return pairArray;
} //function

async function main() {
  getTrades(pairs).then((allpairs) => {
    console.log("Valid pairs:", allpairs.length);
    let pair_string = JSON.stringify(allpairs, undefined, 4);
    fs.writeFileSync(tradeable_pairs_filename, pair_string, "utf8");

    // Valid pairs are any pairs where you get back more than half
    // the dollar value from a trade
    const myfilter = (i) =>
      i.output_dollars > i.input_dollars - i.input_dollars / 2;
    let valid_pairs = allpairs.filter(myfilter);
    fs.writeFileSync(
      validated_pairs_filename,
      JSON.stringify(valid_pairs, undefined, 4),
      "utf8"
    );
  });
}

if (require.main === module) {
  main();
}

function getAllPairs() {
  return JSON.parse(fs.readFileSync(pairs_filename));
}

function getFilteredPairs() {
  let pairs = JSON.parse(fs.readFileSync(validated_pairs_filename));
  //let pair_array = pairs.fromEntries();
  console.log(pairs.map((i) => i.output_dollars));
  const myfilter = (i) =>
    i.output_dollars > i.input_dollars - i.input_dollars / 2;
  return pairs.filter(myfilter);
  //return pairs;
}

function getShortlistPairs() {
  return JSON.parse(fs.readFileSync(shortlist_filename));
}
