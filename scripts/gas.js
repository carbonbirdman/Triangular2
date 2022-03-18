//https://github.com/ethers-io/ethers.js/discussions/2439
const ethers = require("ethers");
const cfg = require("./config");
let rpc_url = cfg.rpc_url;
const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const tokenABI = require("../src/token.json");
const solidRouterABI = require("../src/solidRouter.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const signer = conn.getSigner();
console.log("Onesim starting up");
const axios = require("axios");
//const CoinGecko = require("coingecko-api");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const solidFactoryABI = require("../src/solidFactory.json");
const fs = require("fs");

let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = dx.router_address;
let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));

async function main() {
  const provider = ethers.getDefaultProvider();
  const erc20 = new ethers.Contract(token_address["LQDR"], tokenABI, provider);
  const recipient = "0x831CEf5CC6d5ee48a8E33711c2AC70c5a6B30Cfb";
  const estimation = await erc20.estimateGas.transfer(recipient, 100);
  let dex = "spooky";
  const router_contract = new ethers.Contract(
    router_address[dex],
    routerABI,
    conn
  );
  const gasPrice = await conn.getGasPrice();
  console.log("gas", gasPrice);
  let wallet = "0x831CEf5CC6d5ee48a8E33711c2AC70c5a6B30Cfb";
  let token0 = "FTM";
  let token1 = "LQDR";

  const token0_data = token_data.filter((i) => i.symbol === token0);
  const token1_data = token_data.filter((i) => i.symbol === token1);
  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;

  console.log(ethers.FixedNumber);

  let input_tokens = "1";
  const input_fixed = ethers.FixedNumber.from(input_tokens, token0_decimal);
  console.log(input_fixed);

  let addy0 = ethers.utils.getAddress(token_address[token0]);
  console.log(addy0);
  let addy1 = ethers.utils.getAddress(token_address[token1]);
  let routea = [addy0, addy1];
  let input_wei = ethers.utils.parseUnits(input_tokens, token0_decimal);
  console.log("wei", input_wei);

  const amount_out_a = await router_contract.getAmountsOut(input_wei, routea);
  console.log("A", amount_out_a);
  let [amount_in_token0, amount_out_token1] = amount_out_a;
  let n1_wei = amount_out_token1;
  console.log(n1_wei.toString());
  let n1_tokens = ethers.utils.formatUnits(n1_wei, token1_decimal);

  // swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
  console.log(Date.now());
  try {
    const gas_estimate = await router_contract.estimateGas.swapExactTokensForTokens(
      input_wei,
      n1_wei,
      [token_address["FTM"], token_address["LQDR"]],
      wallet,
      Date.now() + 1000 * 60 * 10,
      {
        //  gasPrice: conn.getGasPrice(),
        //  gasLimit: 310000,
        //  value: n2_wei
      }
    );
    console.log(gas_estimate);
    console.log(estimation);
  } catch (err) {
    console.log(err);
    console.log("Simulation failed");
  }
} //main

main();
