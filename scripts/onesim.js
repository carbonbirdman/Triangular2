const ethers = require("ethers");
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const tokenABI = require("../src/token.json");
const solidRouterABI = require("../src/solidRouter.json");

console.log("Onesim starting up");
const axios = require("axios");
//const CoinGecko = require("coingecko-api");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const solidFactoryABI = require("../src/solidFactory.json");
const fs = require("fs");

const cfg = require("./config");
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
let signer = conn.getSigner();
signer = conn;
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = cfg.router_address;

let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));

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

async function getPair(token0, token1, dex, conn) {
  var pair_address = "None";
  var factory_contract = "None";
  if (dex === "solid") {
    factory_contract = new ethers.Contract(
      factory_address[dex],
      solidFactoryABI,
      conn
    );
    pair_address = await factory_contract.getPair(
      token_address[token0],
      token_address[token1],
      false //this argument is whether the stable pool or volatile
    );
  } else {
    factory_contract = new ethers.Contract(
      factory_address[dex],
      factoryABI,
      conn
    );
    pair_address = await factory_contract.getPair(
      token_address[token0],
      token_address[token1]
    );
  }
  return pair_address;
}

async function getTri(token0, token1, token2, dexa, dexb, dexc, conn) {
  return {
    dexa: dexa,
    dexb: dexb,
    dexc: dexc,
    token0: token0,
    token1: token1,
    token2: token2,
    token0_address: token_address[token0],
    token1_address: token_address[token1],
    token2_address: token_address[token2],
    paira: await getPair(token0, token1, dexa, conn),
    pairb: await getPair(token0, token1, dexb, conn),
    pairc: await getPair(token0, token1, dexc, conn)
  };
}

async function simulateTrade(tri, input_dollars = "1") {
  console.log("simming");
  let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));

  var input_tokens = 0;
  var input_wei = 0;
  var n1_wei = 0;
  var n2_wei = 0;
  var output_wei = 0;
  var output_tokens = 0;
  var output_dollars = "NA";
  var usd_price = 1;

  usd_price = getUSDPrice(tri.token0);
  console.log("Price", usd_price);

  const [dexa, dexb, dexc] = [tri.dexa, tri.dexb, tri.dexc];
  const [token0, token1, token2] = [tri.token0, tri.token1, tri.token2];

  const token0_data = token_data.filter((i) => i.symbol === tri.token0);
  const token1_data = token_data.filter((i) => i.symbol === tri.token1);
  const token2_data = token_data.filter((i) => i.symbol === tri.token2);

  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;
  const token2_decimal = token2_data[0].decimal;

  input_tokens = input_dollars / usd_price;
  //input_tokens = input_tokens.toFixed(token0_decimal);
  console.log(
    input_tokens,
    tri.token0,
    "for $",
    input_dollars,
    "at $",
    usd_price
  );
  const input_fixed = input_tokens.toFixed(token0_decimal);
  console.log(input_fixed, "fixed");

  function getRouter(dex) {
    if (dex === "solid") {
      return new ethers.Contract(router_address[dex], solidRouterABI, conn);
    } else {
      return new ethers.Contract(router_address[dex], routerABI, signer);
    } //else
  } //getRouter

  const router_contract_a = getRouter(dexa);
  const router_contract_b = getRouter(dexb);
  const router_contract_c = getRouter(dexc);

  try {
    let addy0 = ethers.utils.getAddress(token_address[token0]);
    let addy1 = ethers.utils.getAddress(token_address[token1]);
    let addy2 = ethers.utils.getAddress(token_address[token2]);

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

    let routea = getRoute(dexa, addy0, addy1);
    let routeb = getRoute(dexb, addy1, addy2);
    let routec = getRoute(dexc, addy2, addy0);

    input_wei = ethers.utils.parseUnits(input_fixed, token0_decimal);
    console.log("wei", input_wei);

    // TRADE 1
    try {
      const amount_out_a = await router_contract_a.getAmountsOut(
        input_wei,
        routea
      );
      let [amount_in_token0, amount_out_token1] = amount_out_a;
      n1_wei = amount_out_token1;
      console.log(n1_wei.toString());
      let n1_tokens = ethers.utils.formatUnits(n1_wei, token1_decimal);
      //input_tokens.toFixed(token0_decimal);
      console.log("First sale", input_fixed, token0, n1_tokens, token1, dexb);
    } catch (err) {
      console.log("First sale", token0, token1, dexa);
      console.log(token_address[token0], token_address[token1]);
      console.log(err);
    }

    // TRADE 2
    try {
      const amount_out_b = await router_contract_b.getAmountsOut(
        n1_wei,
        // token_address[token1],
        // token_address[token2]
        routeb
      );
      let [amount_in_token1, amount_out_token2] = amount_out_b;
      n2_wei = amount_out_token2;
      let n2_tokens = ethers.utils.formatUnits(n2_wei, token2_decimal);
      console.log("Second sale", n2_tokens, token2, dexb);
    } catch (err) {
      console.log(
        "Second sale error",
        token1,
        token2,
        ethers.utils.formatUnits(n1_wei, token1_decimal),
        routeb,
        dexb
      );
      console.log(err);
    }

    console.log(routec);

    try {
      const amount_out_c = await router_contract_c.getAmountsOut(
        n2_wei,
        routec
      );
      let [amount_in_token2, amount_out_token0] = amount_out_c;
      output_wei = amount_out_token0;
      console.log("WEi out:", output_wei);
      output_tokens = output_wei * Math.pow(10, -token0_decimal);
      console.log("Final sale", output_tokens, token0, dexc);
    } catch (err) {
      console.log(err);
      console.log("Final sale err", token2, token0, dexc);
    }
    output_dollars = output_tokens * usd_price;

    if (false) {
      //console.log("gas_price");
      console.log(conn);
      const gasPrice = await conn.getGasPrice();
      console.log("gas", gasPrice);
      let wallet = "0x831CEf5CC6d5ee48a8E33711c2AC70c5a6B30Cfb";
      // swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
      console.log(Date.now());
      const gas_estimate = await router_contract_b.estimateGas.swapExactTokensForTokens(
        n1_wei,
        n2_wei,
        [token_address[1], token_address[2]],
        Date.now() + 1000 * 60 * 10,
        {
          gasPrice: conn.getGasPrice(),
          gasLimit: 310000,
          value: n2_wei
        }
      );
      console.log(gas_estimate);
    } //catch (err) {
    //console.log(err);
    // console.log("Gas error");
    //}

    console.log(
      input_dollars +
        "->" +
        output_dollars.toPrecision(3) +
        "(" +
        tri.token0 +
        "," +
        tri.token1 +
        "," +
        tri.token2 +
        "," +
        tri.dexa +
        "," +
        tri.dexb +
        "," +
        tri.dexc +
        ")"
    );

    let wei_outputs = { input_wei, n1_wei, n2_wei, output_wei };
    let trade_outputs = { input_tokens, n1_wei, n2_wei, output_wei };
  } catch (err) {
    console.log("trade error:", token0, token1, token2);
    console.log("input", input_tokens);
    //console.log(err);
    console.log(tri);
    output_dollars = "NA";
  }
  let dollar_dollar_bills_yall = { input_dollars, output_dollars };
  // let trade_outputs = { n1_wei, n1, n2_wei, n2, out };
  console.log("DDB", dollar_dollar_bills_yall);
  return dollar_dollar_bills_yall;
} //simulate

async function main() {
  try {
    const test_data = await getTri(
      "FTM",
      "BAEP",
      "TOMB",
      "tomb",
      "spooky",
      "tomb",
      conn
    );
    console.log("Test", test_data);
    let trade_output = simulateTrade(test_data, "1");
    //console.log(trade_output);
  } catch (err) {
    console.log(err);
    console.log("Simulation failed");
  }
}

main();
