const ethers = require("ethers");
const yargs = require("yargs");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Starting up");
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const fs = require("fs");

const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;

//let tokens = Object.keys(token_address);
//var dexes = Object.keys(factory_address);
let tokens = cfg.tokens;
let dexes = cfg.dexs;

console.log(tokens);

function getAllFactories() {
  let factory_contracts_string = fs.readFileSync("data/factory_contracts.json");
  return JSON.parse(factory_contracts_string);
}

var infile = "data/validated_pairs.json";

const argv = yargs
  .option("file", {
    description: "file",
    alias: "f",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

if (argv.file) {
  infile = argv.file;
  console.log("Input file: ", infile);
}

function newTriangleElement(
  dexa,
  dexb,
  dexc,
  token0,
  token1,
  token2,
  token0_address,
  token1_address,
  token2_address,
  paira,
  pairb,
  pairc
) {
  return {
    dexa: dexa,
    dexb: dexb,
    dexc: dexc,
    token0: token0,
    token1: token1,
    token2: token2,
    token0_address: token0_address,
    token1_address: token1_address,
    token2_address: token2_address,
    paira: paira,
    pairb: pairb,
    pairc: pairc
  };
}

function pairstring(pair) {
  return (
    pair.dex + " " + pair.token0 + " " + pair.token1 + " " + pair.pair_address
  );
}

async function main() {
  var dexa_address;
  var dexb_address;
  var dexc_address;

  var factory_contract_a;
  var factory_contract_b;
  var factory_contract_c;

  var factory_contracts = getAllFactories();
  var pairArray = JSON.parse(fs.readFileSync(infile));

  var dexArray;
  var tokenArray;

  var pair0_address_a;
  var pair1_address_b;
  var pair1_address_c;

  let nroutes = dexes.length ** 3 * tokens.length ** 3;
  let iroute = 1;

  var triangleArray = [];
  for (const dexa of dexes) {
    for (const dexb of dexes) {
      for (const dexc of dexes) {
        if (dexa === dexb || dexa === dexc || dexb === dexc) {
          //continue;
          console.log("same dex");
        }

        dexa_address = factory_address[dexa];
        dexb_address = factory_address[dexb];
        dexc_address = factory_address[dexc];

        // DEX COMBINATION
        for (const token0 of tokens) {
          for (const token1 of tokens) {
            for (const token2 of tokens) {
              if (token0 === token1 || token0 === token2 || token1 === token2) {
                continue;
                console.log("same same");
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
                token1,
                token2,
                ".",
                dexc,
                ":",
                token2,
                token0
              );
              iroute = iroute + 1;

              dexArray = [dexa_address, dexb_address, dexc_address];
              tokenArray = [token0, token1, token2];

              let pair_a = pairArray.filter(function (element) {
                return (
                  element.dex === dexa &&
                  ((element.token0 === token0 && element.token1 === token1) ||
                    (element.token0 === token1 && element.token1 === token0))
                ); //return
              });
              if (pair_a.length > 0) {
                //console.log(pair_a);
                console.log("A", pairstring(pair_a[0]));
              } else {
                //console.log("nopair:", dexa, token0, token1);
                continue;
              }

              let pair_b = pairArray.filter(function (element) {
                return (
                  element.dex === dexb &&
                  ((element.token0 === token2 && element.token1 === token1) ||
                    (element.token0 === token1 && element.token1 === token2))
                ); //return
              });

              if (pair_b.length > 0) {
                console.log("B", pairstring(pair_b[0]));
              } else {
                //console.log("nopair", dexb, token1, token2);
                continue;
              }

              let pair_c = pairArray.filter(function (element) {
                return (
                  element.dex === dexc &&
                  ((element.token0 === token0 && element.token1 === token2) ||
                    (element.token0 === token2 && element.token1 === token0))
                ); //return
              });

              if (pair_c.length > 0) {
                console.log("C", pairstring(pair_c[0]));
              } else {
                //console.log("nopair", dexc, token2, token0);
                continue;
              }

              //if (pairs_exist[0] && pairs_exist[1] && pairs_exist[2]) {
              triangleArray.push(
                newTriangleElement(
                  dexa,
                  dexb,
                  dexc,
                  token0,
                  token1,
                  token2,
                  token_address[token0],
                  token_address[token1],
                  token_address[token2],
                  pair_a[0].pair_address,
                  pair_b[0].pair_address,
                  pair_c[0].pair_address
                )
              );

              //console.log("exists")
              //} else {
              //  console.log("missing");
              //
              //if (pair_contract)
            }
          }
          // console.log("WRITE");
          //let tristring = JSON.stringify(triangleArray);
          //let fname = dexa + "_" + dexb + "_" + dexc + "_.json";
          //console.log(fname);
          //fs.writeFileSync(fname, tristring, "utf8");
        }
      } //dexc
    } //dexb
  } //dexa
  console.log(triangleArray.length, "routes");
  let tristring = JSON.stringify(triangleArray);
  fs.writeFileSync("data/routes.json", tristring, "utf8");
  //console.log(triangleArray);
}
main();
