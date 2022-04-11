const ethers = require("ethers");
const yargs = require("yargs");

const factoryABI = require("../src/factory.json");
const routerABI = require("../src/router.json");
const solidRouterABI = require("../src/solidRouter.json");
console.log("Simulation starting up");
const dx = require("../src/dexes");
const simulate = require("../scripts/simulate_solid");
const shortlist = require("../scripts/shortlist");
const merge_shortlist = require("../scripts/merge_shortlist");
const pairABI = require("../src/pairs.json");
const fs = require("fs");

const cfg = require("./config");
let rpc_url = cfg.rpc_url;
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
let router_address = dx.router_address;

const conn = new ethers.providers.JsonRpcProvider(rpc_url);
var infile = "data/generated.json";

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

//"data/trikes.json"
//"data/triangular.json"
//"data/trade_pairs.json"
//data/simulation.json"
let goodTriangles = JSON.parse(fs.readFileSync(infile));

const verbose = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function timeLoop() {
  let i = 0;
  let startTime = Date.now();
  let finalTime = startTime + 1000000;
  let currentTime = Date.now();
  //while (currentTime < finalTime) {
  while (i < 10) {
    var resultsArray = await simulate.runSim(goodTriangles, "5");
    fs.writeFileSync(
      "data/sim" + currentTime + ".json",
      JSON.stringify(resultsArray),
      "utf8"
    );
    console.log("WROTE", i);
    await delay(10000);
    currentTime = Date.now();
    i = i + 1;
  }
  fs.writeFileSync(
    "data/simulation.json",
    JSON.stringify(resultsArray),
    "utf8"
  );
  console.log("Simulation done");
  shortlist.save_shortlist();
}

async function main() {
  await timeLoop();
  merge_shortlist.merge_shortlist();
}

if (require.main === module) {
  main();
}

module.exports = {
  timeLoop: timeLoop
};
