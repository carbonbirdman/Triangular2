const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const solidRouterABI = require("../src/solidRouter.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Simulation starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const fs = require("fs");
const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = dx.router_address;

//let triangles = JSON.parse(fs.readFileSync("data/trikes.json"));
let goodTriangles = JSON.parse(fs.readFileSync("data/triangular.json"));

//make this faster:
//1. set up router contracts on initialisation
//2. pass only addresses and token amounts, convert only 
// at the end.

function estimateTriDexTrade(routera, routerb, routerc, token0, token1, 
  token2, input_wei){
  uint amtBack1 = getAmountOutMin(_router1, _token1, _token2, _amount);
  uint amtBack2 = getAmountOutMin(_router2, _token2, _token3, amtBack1);
  uint amtBack3 = getAmountOutMin(_router3, _token3, _token1, amtBack2);
  return amtBack3;
}


async function simulateTradeFast(tri, input_dollars = "1") {
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

  let pairContractA = new ethers.Contract(tri.paira, pairABI, conn);
  let pairContractB = new ethers.Contract(tri.pairb, pairABI, conn);
  let pairContractC = new ethers.Contract(tri.pairc, pairABI, conn);
  let [posa, posb, posc] = [3, 3, 3];

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

    function getRoute(dex, address0, address1) {
      if (dex === "solid") {
        return [
          {
            from: address0,
            to: address1,
            stable: false
          }
        ];
      } else {
        return [address0, address1];
      } //else
    } //getRouter

    let routea = getRoute(dexa, addy0, addy1);
    let routeb = getRoute(dexa, addy1, addy2);
    let routec = getRoute(dexa, addy2, addy0);

    input_wei = ethers.utils.parseUnits(input_fixed, token0_decimal);
    console.log("wei", input_wei);
    try {
      const amount_out_a = await router_contract_a.getAmountsOut(
        input_wei,
        routea
      );
      let [amount_in_token0, amount_out_token1] = amount_out_a;
      n1_wei = amount_out_token1;
    } catch (err) {
      console.log("First sale", token0, token1);
      console.log(token_address[token0], token_address[token1]);
      console.log(err);
    }

    try {
      const amount_out_b = await router_contract_b.getAmountsOut(
        n1_wei,
        routeb
      );
      let [amount_in_token1, amount_out_token2] = amount_out_b;
      n2_wei = amount_out_token2;
    } catch (err) {
      console.log("Second sale", token1, token2);
      console.log(err);
    }

    try {
      const amount_out_c = await router_contract_c.getAmountsOut(
        n2_wei,
        routec
      );
      let [amount_in_token2, amount_out_token0] = amount_out_c;
      output_wei = amount_out_token0;
      //output_tokens = output_wei * Math.pow(10, -token0_decimal);
      let output_tokens = ethers.utils.formatUnits(output_wei, token1_decimal);
    } catch (err) {
      console.log(err);
      console.log("Final sale", token2, token0);
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
    console.log("trade error:", token0, token1, token2);
    console.log("input", input_tokens);
    console.log(err);
    console.log(tri);
    output_dollars = "NA";
  }
  let dollar_dollar_bills_yall = { input_dollars, output_dollars };
  // let trade_outputs = { n1_wei, n1, n2_wei, n2, out };
  console.log("DDB", dollar_dollar_bills_yall);
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
  while (i < 3) {
    var resultsArray = await simLoop(goodTriangles, "10");
    fs.writeFileSync(
      "data/sim" + currentTime + ".json",
      JSON.stringify(resultsArray),
      "utf8"
    );
    console.log("WROTE", i);
    await delay(20000);
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
