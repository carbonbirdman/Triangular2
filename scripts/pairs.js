const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const solidFactoryABI = require("../src/solidFactory.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const routerABI = require("../src/router.json");
const fs = require("fs");
const null_address = "0x0000000000000000000000000000000000000000";

const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;

//token_address = dx.token_address;
//factory_address = dx.factory_address;

var tokens = Object.keys(token_address);
var dexes = Object.keys(factory_address);

console.log(tokens);
function getAllFactories() {
  var factory_contracts = [];
  for (const dex of dexes) {
    if (dex === "solid") {
      factory_contracts[dex] = new ethers.Contract(
        factory_address[dex],
        solidFactoryABI,
        conn
      );
    } else {
      factory_contracts[dex] = new ethers.Contract(
        factory_address[dex],
        factoryABI,
        conn
      );
    }
  }
  return factory_contracts;
}

function newElement(dex, token0, token1, pair_address) {
  return {
    dex: dex,
    token0: token0,
    token1: token1,
    pair_address: ethers.utils.getAddress(pair_address)
  };
}

async function getAllPairs() {
  var factory_contracts = getAllFactories();

  var pairArray = [];

  //get pairs that exist
  for (const dex of dexes) {
    const factory_contract = factory_contracts[dex];
    //console.log(factory_contract);
    for (const token0 of tokens) {
      for (const token1 of tokens) {
        if (token0 === token1) {
          console.log(dex, token0, token1, "identical");
          continue;
        }
        try {
          var pair_address = "None";
          if (dex == "solid") {
            pair_address = await factory_contract.getPair(
              dx.token_address[token0],
              dx.token_address[token1],
              false //this argument is whether the stable pool or volatile
            );
          } else {
            pair_address = await factory_contract.getPair(
              dx.token_address[token0],
              dx.token_address[token1]
            );
          }
          let pair_check = pairArray.filter(function (element) {
            return (
              element.dex === dex &&
              element.token1 === token0 &&
              element.token0 === token1
            );
          });
          //console.log("CHECK");
          //console.log(pair_check);
          //console.log(pair_check.length);
          if (pair_check.length === 0) {
            if (pair_address === null_address) {
              console.log(dex, token0, token1, pair_address, "null address");
            } else {
              pairArray.push(newElement(dex, token0, token1, pair_address));
            }
            console.log(dex, token0, token1, pair_address, "added");
          } else {
            console.log(dex, token0, token1, pair_address, "dupe exists");
          }
        } catch (err) {
          console.log("no match");
          console.log(err);
          pairArray.push(newElement(dex, token0, token1, "None"));
          console.log(dex, token0, token1, "null");
        }
      }
    }
  }
  //console.log(pairArray);

  const filtered = pairArray.filter(
    (pairArray) => pairArray.pair_address !== null_address
  );
  //console.log(filtered);
  return filtered;
}

async function pairsMain() {
  getAllPairs().then((allpairs) => {
    console.log(allpairs);
    let pair_string = JSON.stringify(allpairs);
    fs.writeFileSync("data/all_pairs.json", pair_string, "utf8");
  });
}

pairsMain();
