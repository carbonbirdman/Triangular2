const fs = require("fs");
let token_data = JSON.parse(fs.readFileSync("data/simulation.json"));
console.log(token_data);
//let profitable = token_data.filter((i) => i.output > i.input);
let profitable = token_data.filter((i) => i.output > 8);
console.log(profitable);

const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
let pairContractA = new ethers.Contract(
  "0xFeBbfeA7674720cEdD35e9384d07F235365c1B3e",
  pairABI,
  conn
);

//console.log(pairContractA);
