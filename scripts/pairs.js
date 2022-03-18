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
  let token0 = "NA";
  let token1 = "NA";

  //get pairs that exist
  for (const dex of dexes) {
    const factory_contract = factory_contracts[dex];
    //console.log(factory_contract);
    for (var tokena of tokens) {
      for (var tokenb of tokens) {
        //console.log("getting");
        //console.log(tokena, tokenb);
        let address_a = await ethers.utils.getAddress(token_address[tokena]);
        let address_b = await ethers.utils.getAddress(token_address[tokenb]);
        //console.log(tokena, tokenb);
        if (tokena === tokenb) {
          console.log(dex, tokena, tokenb, "identical");
          continue;
        }
        try {
          var pair_address = "None";
          if (dex === "solid") {
            pair_address = await factory_contract.getPair(
              dx.token_address[tokena],
              dx.token_address[tokenb],
              false //this argument is whether the stable pool or volatile
            );
          } else {
            pair_address = await factory_contract.getPair(
              dx.token_address[tokena],
              dx.token_address[tokenb]
            );
          }

          //get contract to check order
          try {
            let pairContract = new ethers.Contract(pair_address, pairABI, conn);
            //console.log(pairContract);
            let ptoken0 = await pairContract.token0();
            let ptoken1 = await pairContract.token1();
            //console.log(ptoken0, ptoken1);
            if (address_a == ptoken0 && address_b == ptoken1) {
              token0 = tokena;
              token1 = tokenb;
            } else if (address_a == ptoken1 && address_b == ptoken0) {
              token0 = tokenb;
              token1 = tokena;
            }
          } catch (err) {
            //console.log("no contract", pair_address);
            // console.log(err);
          }

          let pair_check = pairArray.filter(function (element) {
            return (
              element.dex === dex &&
              element.token1 === token1 &&
              element.token0 === token0
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
          //console.log("no match");
          //console.log(err);
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
