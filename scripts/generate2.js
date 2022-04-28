// Calculates routes for 2 token arb ops
const ethers = require("ethers");
const yargs = require("yargs");
const fs = require("fs");
const axios = require("axios");

// Get configuration file
require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

console.log("Starting up generate2");
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const tokenABI = require(cfg.token_abi);
const factoryABI = require(cfg.factory_abi);
const solidFactoryABI = require(cfg.solid_factory_abi);
const solidRouterABI = require(cfg.solid_router_abi);
const pairsABI = require(cfg.pairs_abi);
const routerABI = require(cfg.router_abi);
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = cfg.router_address;
let dexes = cfg.dexs;
let tokens = cfg.tokens;

const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
const reserves_filename = "data/reserves" + cfg.xpid + ".json";
const tokens_filename = "data/tokens" + cfg.xpid + ".json";
const validated_pairs_filename = "data/validated_pairs" + cfg.xpid + ".json";
const routes_filename = "data/routes2" + cfg.xpid + ".json";
const factory_filename = "data/factory_contracts" + cfg.xpid + ".json";

console.log("Setup completed. Creating routes for:", tokens, "and", dexes);

function getAllFactories() {
  let factory_contracts_string = fs.readFileSync(factory_filename);
  return JSON.parse(factory_contracts_string);
}

// File containing validated pairs
// Validated pairs are pairs for which an exchange
// retains over 90% of the initial value
var infile = validated_pairs_filename;

const argv = yargs
  .option("file", {
    description: "input pairs file",
    alias: "f",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

if (argv.file) {
  infile = argv.file;
  console.log("Pairs file: ", infile);
}

function newElement(
  dexa,
  dexb,
  token0,
  token1,
  token0_address,
  token1_address,
  paira,
  pairb
) {
  return {
    dexa: dexa,
    dexb: dexb,
    token0: token0,
    token1: token1,
    token0_address: token0_address,
    token1_address: token1_address,
    paira: paira,
    pairb: pairb
  };
}

function pairstring(pair) {
  return (
    pair.dex + " " + pair.token0 + " " + pair.token1 + " " + pair.pair_address
  );
}

async function routes_main() {
  var dexa_address;
  var dexb_address;

  var factory_contract_a;
  var factory_contract_b;

  var factory_contracts = getAllFactories();
  var pairArray = JSON.parse(fs.readFileSync(infile));

  var dexArray;
  var tokenArray;

  var pair0_address_a;
  var pair1_address_b;

  let nroutes = dexes.length ** 2 * tokens.length ** 2;
  let iroute = 1;

  var biArray = [];
  for (const dexa of dexes) {
    for (const dexb of dexes) {
      if (dexa === dexb) {
        //continue;
        console.log("same dex");
      }

      dexa_address = factory_address[dexa];
      dexb_address = factory_address[dexb];

      // DEX COMBINATION
      for (const token0 of tokens) {
        for (const token1 of tokens) {
          if (token0 === token1) {
            continue;
            console.log("same token");
          }
          console.log(
            iroute,
            "of",
            nroutes,
            ":",
            dexa,
            ":",
            token0,
            token1,
            ".",
            dexb,
            ":",
            token1
          );
          iroute = iroute + 1;

          dexArray = [dexa_address, dexb_address];
          tokenArray = [token0, token1];

          let pair_a = pairArray.filter(function (element) {
            return (
              element.dex === dexa &&
              ((element.token0 === token0 && element.token1 === token1) ||
                (element.token0 === token1 && element.token1 === token0))
            ); //return
          });
          if (pair_a.length > 0) {
            console.log("A", pairstring(pair_a[0]));
          } else {
            //console.log("nopair:", dexa, token0, token1);
            continue;
          }

          let pair_b = pairArray.filter(function (element) {
            return (
              element.dex === dexb &&
              ((element.token0 === token1 && element.token1 === token0) ||
                (element.token0 === token0 && element.token1 === token1))
            ); //return
          });

          if (pair_b.length > 0) {
            console.log("B", pairstring(pair_b[0]));
          } else {
            //console.log("nopair", dexb, token1, token2);
            continue;
          }

          //if (pairs_exist[0] && pairs_exist[1] && pairs_exist[2]) {
          biArray.push(
            newElement(
              dexa,
              dexb,
              token0,
              token1,
              token_address[token0],
              token_address[token1],
              pair_a[0].pair_address,
              pair_b[0].pair_address
            )
          );
        } //token0
      } //token1
    } //dexb
  } //dexa

  console.log(biArray.length, "routes");
  let bistring = JSON.stringify(biArray);
  fs.writeFileSync(routes_filename, bistring, "utf8");
  //console.log(triangleArray);
}

if (require.main === module) {
  routes_main();
}

module.exports = {
  routes_main
};
