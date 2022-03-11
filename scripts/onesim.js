const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Monitor starting up");
const axios = require("axios");
//const CoinGecko = require("coingecko-api");

const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const fs = require("fs");

//triangle data
//dexa: 'spirit',
//dexb: 'spirit',
//dexc: 'spirit',
//token0: 'SPIRIT',
//token1: 'LQDR',
//token2: 'FTM',
//paira: '0xFeBbfeA7674720cEdD35e9384d07F235365c1B3e',
//pairb: '0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2',
//pairc: '0x30748322B6E34545DBe0788C421886AEB5297789'
//dexa: 'spirit',
//dexb: 'spirit',
//dexc: 'spirit',
//token0: 'SPIRIT',
//token1: 'LQDR',
//token2: 'FTM',
//paira: '0xFeBbfeA7674720cEdD35e9384d07F235365c1B3e',
//pairb: '0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2',
//pairc: '0x30748322B6E34545DBe0788C421886AEB5297789'

let token_address = dx.token_address;
let factory_address = dx.factory_address;
let router_address = dx.router_address;

let triangles = JSON.parse(fs.readFileSync("triangular.json"));
let token_data = JSON.parse(fs.readFileSync("tokens.json"));

async function getPair(token0, token1, dex, conn) {
  const factory_contract = new ethers.Contract(
    factory_address[dex],
    factoryABI,
    conn
  );
  const pair_address = await factory_contract.getPair(
    token_address[token0],
    token_address[token1]
  );
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
    paira: getPair(token0, token1, dexa, conn),
    pairb: getPair(token0, token1, dexb, conn),
    pairc: getPair(token0, token1, dexc, conn)
  };
}

const test_data = getTri(
  "FTM",
  "SPIRIT",
  "MIM",
  "spooky",
  "spooky",
  "spooky",
  conn
);

async function simulateTrade(tri, input_dollars = "1") {
  //TODO convert input to dollar equivalent
  const cg_url =
    "https://api.coingecko.com/api/v3/simple/token_price/fantom?contract_addresses=" +
    token_address[tri.token0] +
    "&vs_currencies=usd";
  //let data = await CoinGeckoClient.coins.list();
  //console.log(data);
  const res = await axios.get(cg_url);
  console.log(res.data);
  console.log(cg_url);
  console.log(token_address[tri.token0]);
  const usd_price = res.data[token_address[tri.token0]].usd;
  console.log("Price", usd_price);
  let input_tokens = input_dollars / usd_price;

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
  console.log("First sale", n1_wei);

  const amount_out_b = await router_contract_b.getAmountsOut(n1_wei, [
    token_address[token1],
    token_address[token2]
  ]);
  let [amount_in_token1, amount_out_token2] = amount_out_b;
  const n2_wei = amount_out_token2;
  console.log("Second sale", n2_wei);

  const amount_out_c = await router_contract_c.getAmountsOut(n2_wei, [
    token_address[token2],
    token_address[token0]
  ]);
  let [amount_in_token2, amount_out_token0] = amount_out_c;
  const output_wei = amount_out_token0;
  console.log("Final sale", output_wei);

  const output_tokens = output_wei * Math.pow(10, -token0_decimal);
  const output_dollars = output_tokens * usd_price;
  console.log("in:", input_dollars);
  console.log("out:", output_dollars);

  let wei_outputs = { input_wei, n1_wei, n2_wei, output_wei };
  let trade_outputs = { input_tokens, n1_wei, n2_wei, output_wei };
  let dollar_dollar_bills_yall = { input_dollars, output_dollars };
  // let trade_outputs = { n1_wei, n1, n2_wei, n2, out };
  console.log(trade_outputs);
} //simulate

async function main() {
  console.log(test_data);
  let trade_output = simulateTrade(triangles[0], "1");
  console.log(trade_output);
}

main();

console.log("Simulation done");
