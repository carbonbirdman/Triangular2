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

const simulate = require("../scripts/simulate2");
const shortlist = require("../scripts/shortlist2");
const merge_shortlist = require("../scripts/merge_shortlist");
var shortlist_filename = "data/shortlist2" + cfg.xpid + ".json";
var merged_filename = "data/merged_shortlist2_" + cfg.xpid + ".json";

var infile = "data/routes2" + cfg.xpid + ".json";
var simulate_filename = "data/simulation2" + cfg.xpid + ".json";
var sim_csv_filename = "data/simulation2.csv";

var nrun = 1;

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

async function runMerge() {
  let currentTime = Date.now();
  let routes = JSON.parse(fs.readFileSync(infile));
  var resultsArray = await simulate.runSim(routes, sim_csv_filename, "10");
  fs.writeFileSync(simulate_filename, JSON.stringify(resultsArray), "utf8");
  console.log("routes:" + infile);
  shortlist_filename =
    "data/shortlist2" + "_" + cfg.xpid + "_" + currentTime + ".json";
  shortlist.save_shortlist(simulate_filename, shortlist_filename);
  merge_shortlist.merge_shortlist(shortlist_filename, merged_filename);
}

async function timeLoop() {
  let i = 0;
  let startTime = Date.now();
  let finalTime = startTime + 1500000;
  while (i < nrun) {
    await runMerge();
    console.log("sim loop", i);
    i = i + 1;
    if (i > nrun) {
      break;
    }
    await delay(1200000);
  }
}

async function main() {
  await timeLoop();
}

if (require.main === module) {
  main();
}

module.exports = {
  timeLoop: timeLoop
};
