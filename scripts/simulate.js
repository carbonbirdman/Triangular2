const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
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
let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
let token_price = JSON.parse(fs.readFileSync("data/token_price.json"));
//let goodTriangles = triangles.filter((i) => i.output > i.input);

async function simulateTrade(tri, input_dollars = "1") {
  try {
    var price_line = token_price.filter((i) => i.token === tri.token0);
    if (price_line[0].usdPrice) {
      var usd_price = price_line[0].usdPrice;
    } else {
      console.log("no price");
      console.log(price_line);
      var usd_price = 1;
    }
    console.log("Price", usd_price);
  } catch (err) {
    w;
    console.log("no price");
    var usd_price = 1;
  }
  let input_tokens = input_dollars / usd_price;
  console.log(input_tokens, usd_price);

  const [dexa, dexb, dexc] = [tri.dexa, tri.dexb, tri.dexc];
  const [token0, token1, token2] = [tri.token0, tri.token1, tri.token2];

  const token0_data = token_data.filter((i) => i.symbol === tri.token0);
  const token1_data = token_data.filter((i) => i.symbol === tri.token1);
  const token2_data = token_data.filter((i) => i.symbol === tri.token2);

  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;
  const token2_decimal = token2_data[0].decimal;

  let pairContractA = new ethers.Contract(tri.paira, pairABI, conn);
  let pairContractB = new ethers.Contract(tri.pairb, pairABI, conn);
  let pairContractC = new ethers.Contract(tri.pairc, pairABI, conn);
  let [posa, posb, posc] = [3, 3, 3];

  const router_contract_a = new ethers.Contract(
    router_address[dexa],
    routerABI,
    conn
  );
  const router_contract_b = new ethers.Contract(
    router_address[dexb],
    routerABI,
    conn
  );
  const router_contract_c = new ethers.Contract(
    router_address[dexc],
    routerABI,
    conn
  );

  try {
    const input_wei = ethers.utils.parseUnits(
      String(input_tokens),
      token0_decimal
    );

    const amount_out_a = await router_contract_a.getAmountsOut(input_wei, [
      token_address[token0],
      token_address[token1]
    ]);
    let [amount_in_token0, amount_out_token1] = amount_out_a;
    const n1_wei = amount_out_token1;
    //console.log("First sale", n1_wei);

    const amount_out_b = await router_contract_b.getAmountsOut(n1_wei, [
      token_address[token1],
      token_address[token2]
    ]);
    let [amount_in_token1, amount_out_token2] = amount_out_b;
    const n2_wei = amount_out_token2;
    //console.log("Second sale", n2_wei);

    const amount_out_c = await router_contract_c.getAmountsOut(n2_wei, [
      token_address[token2],
      token_address[token0]
    ]);
    let [amount_in_token2, amount_out_token0] = amount_out_c;
    const output_wei = amount_out_token0;
    //console.log("Final sale", output_wei);

    const output_tokens = output_wei * Math.pow(10, -token0_decimal);
    const output_dollars = output_tokens * usd_price;

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
        ")" //+
      //"[" +
      //tri.input +
      //"->" +
      //tri.output.toPrecision(3) +
      //"]"
    );

    let wei_outputs = { input_wei, n1_wei, n2_wei, output_wei };
    let trade_outputs = { input_tokens, n1_wei, n2_wei, output_wei };
  } catch (err) {
    console.log("trade error");
    console.log(err);
    console.log(tri);
    var output_dollars = "NA";
  }
  let dollar_dollar_bills_yall = { input_dollars, output_dollars };
  // let trade_outputs = { n1_wei, n1, n2_wei, n2, out };
  //console.log(trade_outputs);
  return dollar_dollar_bills_yall;
} //simulate

async function simLoop(input_dollars = "10") {
  let resultsArray = [];
  let naTri = [];
  let loliqTri = [];
  var stream = fs.createWriteStream("data/simulation.txt", { flags: "a" });
  for (const tri of goodTriangles) {
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

    stream.write(
      trade_output.input_dollars +
        "," +
        trade_output.output_dollars +
        "," +
        tri.dexa +
        tri.token0 +
        "," +
        tri.dexb +
        tri.token1 +
        "," +
        tri.dexc +
        tri.token2 +
        "," +
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
  while (i < 1) {
    const resultsArray = await simLoop("10");
    fs.writeFileSync(
      "data/sim" + currentTime + ".json",
      //"simulation.json",
      JSON.stringify(resultsArray),
      "utf8"
    );
    console.log("WROTE", i);
    await delay(10000);
    currentTime = Date.now();
    i = i + 1;
  }
  console.log("Simulation done");
}

async function main() {
  await timeLoop();
}

main();
