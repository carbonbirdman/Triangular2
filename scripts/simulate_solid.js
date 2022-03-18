const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const solidRouterABI = require("../src/solidRouter.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Simulation starting up");
const axios = require("axios");
//const CoinGecko = require("coingecko-api");

const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const fs = require("fs");

const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = dx.router_address;

//let triangles = JSON.parse(fs.readFileSync("data/trikes.json"));
let goodTriangles = JSON.parse(fs.readFileSync("data/triangular.json"));
//let goodTriangles = JSON.parse(fs.readFileSync("data/trade_pairs.json"));
let goodTriangles = JSON.parse(fs.readFileSync("data/generated.json"));
//let goodTriangles = JSON.parse(fs.readFileSync("data/simulation.json"));
let reserves = JSON.parse(fs.readFileSync("data/reserves.json"));
//goodTriangles = goodTriangles.filter((i) => i.output > i.input-i.input/10);

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

const verbose = false;
async function simulateTrade(tri, input_dollars = "1") {
  if (verbose) {
    console.log("simming");
  }
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
  //console.log("Price", usd_price);

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
  if (verbose) {
    console.log(
      input_tokens,
      tri.token0,
      "for $",
      input_dollars,
      "at $",
      usd_price
    );
  }
  const input_fixed = input_tokens.toFixed(token0_decimal);
  //console.log(input_fixed, "fixed");

  function getRouter(dex) {
    if (dex === "solid") {
      return new ethers.Contract(router_address[dex], solidRouterABI, conn);
    } else {
      return new ethers.Contract(router_address[dex], routerABI, conn);
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
    //console.log("wei", input_wei);
    // TRADE 1
    try {
      const amount_out_a = await router_contract_a.getAmountsOut(
        input_wei,
        routea
      );
      let [amount_in_token0, amount_out_token1] = amount_out_a;
      n1_wei = amount_out_token1;
      //console.log(n1_wei.toString());
      let n1_tokens = ethers.utils.formatUnits(n1_wei, token1_decimal);
      //input_tokens.toFixed(token0_decimal);
      if (verbose) {
        console.log("First sale", input_fixed, token0, n1_tokens, token1, dexb);
      }
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
      if (verbose) {
        console.log("Second sale", n2_tokens, token2, dexb);
      }
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

    //console.log(routec);

    try {
      const amount_out_c = await router_contract_c.getAmountsOut(
        n2_wei,
        routec
      );
      let [amount_in_token2, amount_out_token0] = amount_out_c;
      output_wei = amount_out_token0;
      //console.log("Wei out:", output_wei);
      output_tokens = output_wei * Math.pow(10, -token0_decimal);
      if (verbose) {
        console.log("Final sale", output_tokens, token0, dexc);
      }
    } catch (err) {
      //console.log(err);
      console.log("Final sale", token2, token0, dexc);
    }
    output_dollars = output_tokens * usd_price;

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
  //console.log("Profit/loss:", dollar_dollar_bills_yall);
  return dollar_dollar_bills_yall;
} //simulate

async function simLoop(inputTriangles, input_dollars = "10") {
  let resultsArray = [];
  let naTri = [];
  let loliqTri = [];
  let stream_file_name = "data/simulation.txt";

  try {
    if (fs.existsSync("data/simulation.txt")) {
      var stream = fs.createWriteStream(stream_file_name, { flags: "a" });
    } else {
      var stream = fs.createWriteStream(stream_file_name, { flags: "a" });
      //write header
      stream.write("time,input,output,dexa,dexb,dexc,token0,token1,token2 \n");
    }
  } catch (err) {
    console.error(err);
  }

  for (const tri of inputTriangles) {
    let trade_output = await simulateTrade(tri, input_dollars);

    let triOut = {
      dexa: tri.dexa,
      dexb: tri.dexb,
      dexc: tri.dexc,
      token0: tri.token0,
      token1: tri.token1,
      token2: tri.token2,
      token0_address: tri.token0_address,
      token1_address: tri.token1_address,
      token2_address: tri.token2_address,
      paira: tri.paira,
      pairb: tri.pairb,
      pairc: tri.pairc,
      input: trade_output.input_dollars,
      output: trade_output.output_dollars
    };

    if (trade_output.output_dollars == "NA") {
      naTri.push(triOut);
    } else if (trade_output.output_dollars < input_dollars / 10) {
      loliqTri.push(triOut);
    } else {
      resultsArray.push(triOut);
    }

    let currentTime = Date.now();
    stream.write(
      currentTime +
        "," +
        trade_output.input_dollars +
        "," +
        trade_output.output_dollars +
        "," +
        tri.dexa +
        "," +
        tri.dexb +
        "," +
        tri.dexb +
        "," +
        tri.token0 +
        "," +
        tri.token1 +
        "," +
        tri.token2 +
        "\n"
    );
  }
  return resultsArray;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function timeLoop() {
  let i = 0;
  let startTime = Date.now();
  let finalTime = startTime + 20000;
  let currentTime = Date.now();
  //while (currentTime < finalTime) {
  while (i < 10) {
    var resultsArray = await simLoop(goodTriangles, "5");
    fs.writeFileSync(
      "data/sim" + currentTime + ".json",
      JSON.stringify(resultsArray),
      "utf8"
    );
    console.log("WROTE", i);
    await delay(2000000);
    currentTime = Date.now();
    i = i + 1;
  }
  fs.writeFileSync(
    "data/simulation.json",
    JSON.stringify(resultsArray),
    "utf8"
  );
  console.log("Simulation done");
}

async function main() {
  await timeLoop();
}

if (require.main === module) {
  main();
}

module.exports = {
  timeLoop: timeLoop
};
