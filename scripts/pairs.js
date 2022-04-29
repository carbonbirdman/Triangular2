const ethers = require("ethers");
const fs = require("fs");

require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

console.log("Starting up pairs");
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const tokenABI = require(cfg.token_abi);
const factoryABI = require(cfg.factory_abi);
const solidFactoryABI = require(cfg.solid_factory_abi);
const pairsABI = require(cfg.pairs_abi);
const routerABI = require(cfg.router_abi);
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let dexes = cfg.dexs;
let tokens = cfg.tokens;

const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";

const null_address = "0x0000000000000000000000000000000000000000";

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
    pair_address: pair_address //ethers.utils.getAddress(pair_address)
  };
}

async function getAllPairs() {
  var factory_contracts = getAllFactories();

  var pairArray = [];
  let token0 = "NA";
  let token1 = "NA";

  let npairs = dexes.length * tokens.length * tokens.length;
  let ipair = 1;

  //get pairs that exist
  for (const dex of dexes) {
    const factory_contract = factory_contracts[dex];
    //console.log(factory_contract);
    for (const tokena of tokens) {
      for (const tokenb of tokens) {
        //console.log("getting");
        console.log(ipair, "of", npairs, ":", tokena, tokenb);
        ipair = ipair + 1;
        if (tokena === tokenb) {
          console.log(dex, tokena, tokenb, "identical");
          continue;
        }

        const address_a = await ethers.utils.getAddress(token_address[tokena]);
        const address_b = await ethers.utils.getAddress(token_address[tokenb]);

        let pair_address = "None";
        try {
          //Get pair address
          if (dex === "solid") {
            pair_address = await factory_contract.getPair(
              token_address[tokena],
              token_address[tokenb],
              false //this argument is whether the stable pool or volatile
            );
          } else {
            pair_address = await factory_contract.getPair(
              token_address[tokena],
              token_address[tokenb]
            );
          }

          token0 = tokena;
          token1 = tokenb;
          // Get pair contract to check order
          try {
            let pairContract = new ethers.Contract(
              pair_address,
              pairsABI,
              conn
            );
            //console.log(pairContract);
            let ptoken0 = await pairContract.token0();
            let ptoken1 = await pairContract.token1();
            //console.log(ptoken0, ptoken1);
            if (address_a === ptoken0 && address_b === ptoken1) {
              token0 = tokena;
              token1 = tokenb;
            } else if (address_a === ptoken1 && address_b === ptoken0) {
              token0 = tokenb;
              token1 = tokena;
            }
          } catch (err) {
            console.log("no contract");
            //console.log(err);
          }

          // does it already exist?
          let pair_check = pairArray.filter(function (element) {
            return (
              element.dex === dex &&
              element.token1 === token1 &&
              element.token0 === token0
            );
          });

          if (pair_check.length === 0) {
            if (pair_address === null_address) {
              console.log(dex, token0, token1, pair_address, "null address");
            } else {
              pairArray.push(newElement(dex, token0, token1, pair_address));
              console.log(dex, token0, token1, pair_address, "added");
            }
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
  return new Promise(function (resolve, reject) {
    getAllPairs().then((allpairs) => {
      //console.log(allpairs);
      let pair_string = JSON.stringify(allpairs, undefined, 4);
      fs.writeFileSync(pairs_filename, pair_string, "utf8");
      resolve(pairs_filename);
    });
  });
}

if (require.main === module) {
  pairsMain();
}

module.exports = {
  pairsMain
};
