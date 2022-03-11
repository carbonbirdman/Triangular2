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

//token_address = dx.token_address;
//factory_address = dx.factory_address;
var tokens = Object.keys(token_address);
var dexes = Object.keys(factory_address);
let token_price = JSON.parse(fs.readFileSync("data/token_price.json"));

console.log(tokens);
function getAllFactories() {
  var factory_contracts = [];
  for (const dex of dexes) {
    factory_contracts[dex] = new ethers.Contract(
      dx.factory_address[dex],
      factoryABI,
      conn
    );
  }
  return factory_contracts;
}

function newElement(
  dex,
  token0,
  token1,
  pair_address,
  reserves0,
  reserves1,
  usdVal
) {
  return {
    dex: dex,
    token0: token0,
    token1: token1,
    pair_address: ethers.utils.getAddress(pair_address),
    reserves0: reserves0,
    reserves1: reserves1,
    usdVal: usdVal
  };
}

async function getAllPairs() {
  var factory_contracts = getAllFactories();
  var pairArray = [];

  for (const dex of dexes) {
    const factory_contract = factory_contracts[dex];
    //console.log(factory_contract);
    for (const token0 of tokens) {
      for (const token1 of tokens) {
        if (token0 === token1) {
          console.log(dex, token0, token1, "identical");
          continue;
        }
        let pair_address = "None";
        let reserves0 = 0;
        let reserves1 = 0;
        let usdVal = 0;
        let reserves = [];

        try {
          console.log(dex);
          pair_address = await factory_contract.getPair(
            dx.token_address[token0],
            dx.token_address[token1]
          );

          let pair_check = pairArray.filter(function (element) {
            return (
              element.dex === dex &&
              element.token1 === token0 &&
              element.token0 === token1
            );
          });

          if (pair_check.length == 0) {
            console.log(dex, token0, token1, pair_address, "adding");

            // TRY TO GET CONTRACT AND PRICE FROM API
            try {
              let pairContract = new ethers.Contract(
                pair_address,
                pairABI,
                conn
              );
              reserves = await pairContract.getReserves();
              [reserves0, reserves1] = [
                reserves[0].toString(),
                reserves[1].toString()
              ];
              console.log(reserves[0].toString(), reserves[0]);
            } catch (err) {
              console.log("Problem getting reserves");
              console.log(err);
            }
            try {
              usdprice0 = token_price[token_address[token0].toLowerCase()];
              usdprice1 = token_price[token_address[token0].toLowerCase()];
              usdVal = reserves0.toN * usdprice0 + reserves1 * usdprice1;
            } catch (err) {
              console.log("Problem getting prices");
              console.log(err);
            }
            // DONE GETTING CONTRACT AND PRICE
          } else {
            console.log(dex, token0, token1, pair_address, "dupe exists");
          }
        } catch (err) {
          console.log("no match");
          console.log(err);
          //pairArray.push(newElement(dex, token0, token1, "None", "0", "0"));
          console.log(dex, token0, token1, "null");
        }
        // Save data
        pairArray.push(
          newElement(
            dex,
            token0,
            token1,
            pair_address,
            reserves0,
            reserves1,
            usdVal
          )
        );
      }
    }
  }
  //console.log(pairArray);
  const null_address = "0x0000000000000000000000000000000000000000";
  const filtered = pairArray.filter(
    (pairArray) => pairArray.pair_address !== null_address
  );
  //console.log(filtered);
  return pairArray;
}

async function main() {
  getAllPairs().then((allpairs) => {
    //console.log(allpairs);
    let pair_string = JSON.stringify(allpairs);
    fs.writeFileSync("data/ballpark.json", pair_string, "utf8");
  });
}

main();
