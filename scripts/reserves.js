const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const routerABI = require("../src/router.json");
const fs = require("fs");
const axios = require("axios");

const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;

//let tokens = Object.keys(token_address);
//var dexes = Object.keys(factory_address);
let tokens = cfg.tokens;
let dexes = cfg.dexs;

let pairs = JSON.parse(fs.readFileSync("data/all_pairs.json"));

function newElement(dex, token0, token1, pair_address, reserves0, reserves1) {
  return {
    dex: dex,
    token0: token0,
    token1: token1,
    pair_address: ethers.utils.getAddress(pair_address),
    reserves0: reserves0,
    reserves1: reserves1
  };
}

async function getReserves() {
  var pairArray = [];
  for (const pair of pairs) {
    let reserves0 = 0;
    let reserves1 = 0;

    try {
      let pairContract = new ethers.Contract(pair.pair_address, pairABI, conn);
      let reserves = await pairContract.getReserves();
      [reserves0, reserves1] = [reserves[0].toString(), reserves[1].toString()];
      console.log(pair.token0, pair.token1, reserves0, reserves1);
    } catch (err) {
      console.log("Problem getting reserves");
      console.log(err);
    }
    // Save data
    pairArray.push(
      newElement(
        pair.dex,
        pair.token0,
        pair.token1,
        pair.pair_address,
        reserves0,
        reserves1
      )
    );
  } //for
  return pairArray;
} //function

async function main() {
  getReserves().then((allpairs) => {
    //console.log(allpairs);
    let pair_string = JSON.stringify(allpairs);
    fs.writeFileSync("data/reserves.json", pair_string, "utf8");
  });
}

main();
