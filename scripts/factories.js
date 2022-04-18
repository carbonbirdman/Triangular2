const ethers = require("ethers");
const fs = require("fs");

console.log("Starting up factories");
require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
//const tokenABI = require(cfg.token_abi);
const factoryABI = require(cfg.factory_abi);
//const pairABI = require(cfg.pair_abi);
//let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let dexes = cfg.dexs;

const factory_filename = "data/factory_contracts" + cfg.xpid + ".json";

function getAllFactories() {
  const getFactory = (dex) =>
    new ethers.Contract(factory_address[dex], factoryABI, conn);
  const factory_contracts = dexes.forEach(getFactory);
  return factory_contracts;
}

function main() {
  //var factory_contracts_1 = getAllFactories();
  var factory_contracts = [];
  for (const dex of dexes) {
    factory_contracts[dex] = new ethers.Contract(
      factory_address[dex],
      factoryABI,
      conn
    );
  }
  //console.log(factory_contracts);
  //console.log(Object.keys(factory_contracts));
  // console.log(Object.keys(factory_contracts_1));
  //console.log(factory_contracts["spooky"]);
  let factory_string = JSON.stringify(factory_contracts);
  fs.writeFileSync(factory_filename, factory_string, "utf8");
  console.log("wrote");
}

main();
