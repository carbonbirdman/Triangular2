const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const solidFactoryABI = require("../src/solidFactory.json");
const fs = require("fs");
const solidRouterABI = require("../src/solidRouter.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
let factory_contract = new ethers.Contract(
  "0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28",
  solidFactoryABI,
  conn
);
const cfg = require("./config");
let token_address = cfg.token_address;

console.log(factory_contract);

async function main() {
  let pair_address = await factory_contract.getPair(
    "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9",
    false
  );
  console.log(pair_address);

  const router_contract = new ethers.Contract(
    "0xa38cd27185a464914D3046f0AB9d43356B34829D",
    solidRouterABI,
    conn
  );

  let token0 = "FTM";
  let token1 = "LQDR";
  let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
  const token0_data = token_data.filter((i) => i.symbol === token0);
  const token0_decimal = token0_data[0].decimal;
  const token1_data = token_data.filter((i) => i.symbol === token1);
  const token1_decimal = token1_data[0].decimal;

  let input_tokens = "10";
  //console.log(ethers.utils);
  //console.log(ethers.FixedNumber.from);
  let input_fixed = ethers.FixedNumber.from(input_tokens, token0_decimal);
  //const input_fixed = FixedNumber.fromString("10", token0_decimal);
  console.log(input_fixed);

  //let input_wei = ethers.utils.parseUnits(input_fixed, token0_decimal);
  let input_wei = ethers.utils.parseUnits(input_tokens, token0_decimal);
  console.log("wei", input_wei);

  console.log(token_address[token0], token_address[token1]);
  console.log(router_contract);

  // let route =

  let pair_addy = await router_contract.pairFor(
    ethers.utils.getAddress(token_address[token0]),
    ethers.utils.getAddress(token_address[token1]),
    false
  );
  console.log(pair_addy);

  const reserves = await router_contract.getReserves(
    ethers.utils.getAddress(token_address[token0]),
    ethers.utils.getAddress(token_address[token1]),
    false
  );
  console.log(reserves);

  //'getAmountOut(uint256,address,address)': [Function (anonymous)],
  // 'getAmountsOut(uint256,(address,address,bool)[])': [Function (anonymous)],
  // 'getReserves(address,address,bool)': [Function (anonymous)],
  // 'isPair(address)': [Function (anonymous)],
  // 'pairFor(address,address,bool)': [Function (anonymous)],

  const amount_out = await router_contract.getAmountOut(
    input_wei,
    ethers.utils.getAddress(token_address[token0]),
    ethers.utils.getAddress(token_address[token1])
  );
  console.log(ethers.utils.formatUnits(amount_out[0], 18));

  let addy0 = ethers.utils.getAddress(token_address[token0]);
  let addy1 = ethers.utils.getAddress(token_address[token1]);

  let route = [
    {
      from: addy0,
      to: addy1,
      stable: false
    }
  ];

  //route = [addy0, addy1, false];

  console.log(route);
  const amounts_out = await router_contract.getAmountsOut(input_wei, route);
  console.log(amounts_out);

  let [amount_in_token0, amount_out_token1] = amounts_out;
  let n1_wei = amount_out_token1;

  console.log("First sale", n1_wei);

  console.log("First sale", ethers.utils.formatUnits(n1_wei, token1_decimal));
}

main();
