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
  //if (usd_price == "NA") {
  //  usd_price = 1.0;
  //}
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

async function simulateTrade(pair, input_dollars = "1") {
  console.log("Simulate trade for pair ...");
  let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
  var input_tokens = 0;
  var input_wei = 0;
  var output_wei = 0;
  var output_tokens = 0;
  var output_dollars = "NA";
  var token0_usd_price = 1;
  var token1_usd_price = 1;
  token0_usd_price = getUSDPrice(pair.token0);
  token1_usd_price = getUSDPrice(pair.token1);

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
    fs.writeFileSync("data/tradeable_pairs.json", pair_string, "utf8");

    // Valid pairs are any pairs where you get back more than half
    // the dollar value from a trade
    const myfilter = (i) =>
      i.output_dollars > i.input_dollars - i.input_dollars / 2;
    let valid_pairs = allpairs.filter(myfilter);
    fs.writeFileSync(
      "data/validated_pairs.json",
      JSON.stringify(valid_pairs, undefined, 4),
      "utf8"
    );
  });
}

if (require.main === module) {
  main();
}

//"data/trikes.json"
//"data/triangular.json"
//"data/trade_pairs.json"
//data/simulation.json
function getAllPairs() {
  return JSON.parse(fs.readFileSync("data/all_pairs.json"));
}

function getFilteredPairs() {
  let pairs = JSON.parse(fs.readFileSync("data/validated_pairs.json"));
  //let pair_array = pairs.fromEntries();
  console.log(pairs.map((i) => i.output_dollars));
  const myfilter = (i) =>
    i.output_dollars > i.input_dollars - i.input_dollars / 2;
  return pairs.filter(myfilter);
  //return pairs;
}

function getShortlistPairs() {
  return JSON.parse(fs.readFileSync("data/shortlist.json"));
}
