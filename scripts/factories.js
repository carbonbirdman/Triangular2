const ethers = require("ethers");
const factoryABI = require("../src/factory.json");

console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");

const cfg = require("./config");
let rpc_url = cfg.rpc_url;
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;

const conn = new ethers.providers.JsonRpcProvider(rpc_url);

var tokens = Object.keys(token_address);
var dexes = Object.keys(factory_address);
const fs = require("fs");

console.log(tokens);

function getAllFactories() {
  const getFactory = (dex) =>
    new ethers.Contract(dx.factory_address[dex], factoryABI, conn);
  const factory_contracts = dexes.forEach(getFactory);
  return factory_contracts;
}

function main() {
  //var factory_contracts_1 = getAllFactories();
  var factory_contracts = [];
  for (const dex of dexes) {
    factory_contracts[dex] = new ethers.Contract(
      dx.factory_address[dex],
      factoryABI,
      conn
    );
  }
  //console.log(factory_contracts);
  //console.log(Object.keys(factory_contracts));
  // console.log(Object.keys(factory_contracts_1));
  //console.log(factory_contracts["spooky"]);
  let factory_string = JSON.stringify(factory_contracts);
  fs.writeFileSync("data/factory_contracts.json", factory_string, "utf8");
  console.log("wrote");
}

main();
