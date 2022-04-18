const ethers = require("ethers");
const yargs = require("yargs");
const fs = require("fs");

require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);
console.log("xp", cfg.xpid);

console.log("Starting up looper");
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

const simulate = require("../scripts/simulate");
const shortlist = require("../scripts/shortlist");
const merge_shortlist = require("../scripts/merge_shortlist");
var shortlist_filename_i = "data/shortlist.json";
var merged_filename_i = "data/merged_shortlist_" + cfg.xpid + ".json";

var infile = "data/routes.json";
var simulate_filename = "data/simulation.json";
var nrun = 2;

const argv = yargs
  .option("file", {
    description: "file",
    alias: "f",
    type: "string"
  })
  .option("nrun", {
    alias: "n",
    description: "how many iterations",
    type: "integer"
  })
  .help()
  .alias("help", "h").argv;

if (argv.file) {
  var infile = argv.file;
  console.log("Input file: ", infile);
}

if (argv.nrun) {
  var nrun = argv.nrun;
  console.log("Runs: ", nrun);
}

if (argv._.includes("special")) {
  console.log(`Special option selected`);
}

const verbose = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function timeLoop() {
  let i = 0;
  let startTime = Date.now();
  let finalTime = startTime + 1500000;
  let currentTime = Date.now();
  //while (currentTime < finalTime) {
  // async function runSim(
  //   inputTriangles,
  //    outputCSV = "data/simulation.csv",
  //   input_dollars = "10"
  //  )
  let routes = JSON.parse(fs.readFileSync(infile));
  console.log(routes);
  while (i < nrun) {
    var resultsArray = await simulate.runSim(
      routes,
      "data/simulation.csv",
      "5"
    );
    console.log(resultsArray);
    fs.writeFileSync(
      "data/sim" + currentTime + ".json",
      JSON.stringify(resultsArray),
      "utf8"
    );
    console.log("WROTE", i);
    await delay(2000);
    currentTime = Date.now();
    i = i + 1;
  }
  fs.writeFileSync(simulate_filename, JSON.stringify(resultsArray), "utf8");
  console.log("Simulation done");
  shortlist.save_shortlist(simulate_filename, shortlist_filename_i);
}

async function main() {
  await timeLoop();
  merge_shortlist.merge_shortlist(
    (shortlist_filename = shortlist_filename_i),
    (merged_filename = merged_filename_i)
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  timeLoop: timeLoop
};
