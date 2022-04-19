const ethers = require("ethers");
const yargs = require("yargs");
const fs = require("fs");
const axios = require("axios");

require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

console.log("Starting up simulate");
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

const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
const reserves_filename = "data/reserves" + cfg.xpid + ".json";
const tokens_filename = "data/tokens" + cfg.xpid + ".json";
const tradeable_pairs_filename = "data/tradeable_pairs" + cfg.xpid + ".json";
const validated_pairs_filename = "data/validated_pairs" + cfg.xpid + ".json";
const shortlist_filename = "data/shortlist" + cfg.xpid + ".json";
const prices_filename = "data/token_price" + cfg.xpid + ".json";
const routes_filename = "data/routes" + cfg.xpid + ".json";
const last_run_filename = "data/last_run" + cfg.xpid + ".txt";
const simulate_filename = "data/simulation" + cfg.xpid + ".json";

var infile = routes_filename;

const argv = yargs
  .option("input", {
    description: "input file",
    alias: "i",
    type: "string"
  })
  .option("output", {
    description: "output file",
    alias: "o",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

if (argv.input) {
  var infile = argv.input;
  console.log("Input file: ", infile);
}
if (argv.output) {
  var outfile = argv.output;
  console.log("Output file: ", outfile);
}

//"data/trikes.json"
//"data/triangular.json"
//"data/trade_pairs.json"
//data/simulation.json"
let goodTriangles = JSON.parse(fs.readFileSync(infile));

function getUSDPrice(tokenSymbol) {
  let token_price = JSON.parse(fs.readFileSync(prices_filename));
  let usd_price = 1;
  try {
    var price_line = token_price.filter((i) => i.token === tokenSymbol);
    if (price_line[0].usdPrice) {
      usd_price = price_line[0].usdPrice;
    } else {
      console.log("no price:", price_line);
    }
  } catch (err) {
    console.log("error getting price");
  }
  return usd_price;
}

const verbose = false;
async function simulateTrade(tri, input_dollars = "1") {
  if (verbose) {
    console.log("simming");
  }
  let token_data = JSON.parse(fs.readFileSync(tokens_filename));

  var input_tokens = 0;
  var input_wei = 0;
  var n1_wei = 0;
  var n2_wei = 0;
  var output_wei = 0;
  var output_tokens = 0;
  var output_dollars = "NA";
  var usd_price = 1;

  usd_price = getUSDPrice(tri.token0);
  //console.log("Price", usd_price);

  const [dexa, dexb, dexc] = [tri.dexa, tri.dexb, tri.dexc];
  const [token0, token1, token2] = [tri.token0, tri.token1, tri.token2];

  const token0_data = token_data.filter((i) => i.symbol === tri.token0);
  const token1_data = token_data.filter((i) => i.symbol === tri.token1);
  const token2_data = token_data.filter((i) => i.symbol === tri.token2);

  const token0_decimal = token0_data[0].decimal;
  const token1_decimal = token1_data[0].decimal;
  const token2_decimal = token2_data[0].decimal;

  input_tokens = input_dollars / usd_price;
  //input_tokens = input_tokens.toFixed(token0_decimal);
  if (verbose) {
    console.log(
      input_tokens,
      tri.token0,
      "for $",
      input_dollars,
      "at $",
      usd_price
    );
  }
  const input_fixed = input_tokens.toFixed(token0_decimal);
  //console.log(input_fixed, "fixed");

  function getRouter(dex) {
    if (dex === "solid") {
      return new ethers.Contract(router_address[dex], solidRouterABI, conn);
    } else {
      return new ethers.Contract(router_address[dex], routerABI, conn);
    } //else
  } //getRouter

  const router_contract_a = getRouter(dexa);
  const router_contract_b = getRouter(dexb);
  const router_contract_c = getRouter(dexc);

  try {
    let addy0 = ethers.utils.getAddress(token_address[token0]);
    let addy1 = ethers.utils.getAddress(token_address[token1]);
    let addy2 = ethers.utils.getAddress(token_address[token2]);

    function getRoute(dex, add0, add1) {
      if (dex === "solid") {
        return [
          {
            from: add0,
            to: add1,
            stable: false
          }
        ];
      } else {
        return [add0, add1];
      } //else
    } //getRouter

    let routea = getRoute(dexa, addy0, addy1);
    let routeb = getRoute(dexb, addy1, addy2);
    let routec = getRoute(dexc, addy2, addy0);

    input_wei = ethers.utils.parseUnits(input_fixed, token0_decimal);
    //console.log("wei", input_wei);
    // TRADE 1
    try {
      const amount_out_a = await router_contract_a.getAmountsOut(
        input_wei,
        routea
      );
      let [amount_in_token0, amount_out_token1] = amount_out_a;
      n1_wei = amount_out_token1;
      //console.log(n1_wei.toString());
      let n1_tokens = ethers.utils.formatUnits(n1_wei, token1_decimal);
      //input_tokens.toFixed(token0_decimal);
      if (verbose) {
        console.log("First sale", input_fixed, token0, n1_tokens, token1, dexb);
      }
    } catch (err) {
      console.log("First sale", token0, token1, dexa);
      console.log(token_address[token0], token_address[token1]);
      console.log(err);
    }

    // TRADE 2
    try {
      const amount_out_b = await router_contract_b.getAmountsOut(
        n1_wei,
        // token_address[token1],
        // token_address[token2]
        routeb
      );
      let [amount_in_token1, amount_out_token2] = amount_out_b;
      n2_wei = amount_out_token2;
      let n2_tokens = ethers.utils.formatUnits(n2_wei, token2_decimal);
      if (verbose) {
        console.log("Second sale", n2_tokens, token2, dexb);
      }
    } catch (err) {
      console.log(
        "Second sale error",
        token1,
        token2,
        ethers.utils.formatUnits(n1_wei, token1_decimal),
        routeb,
        dexb
      );
      console.log(err);
    }

    //console.log(routec);

    try {
      const amount_out_c = await router_contract_c.getAmountsOut(
        n2_wei,
        routec
      );
      let [amount_in_token2, amount_out_token0] = amount_out_c;
      output_wei = amount_out_token0;
      //console.log("Wei out:", output_wei);
      output_tokens = output_wei * Math.pow(10, -token0_decimal);
      if (verbose) {
        console.log("Final sale", output_tokens, token0, dexc);
      }
    } catch (err) {
      //console.log(err);
      console.log("Final sale", token2, token0, dexc);
    }
    output_dollars = output_tokens * usd_price;

    console.log(
      input_dollars +
        "->" +
        output_dollars +
        "(" +
        tri.token0 +
        "," +
        tri.token1 +
        "," +
        tri.token2 +
        "," +
        tri.dexa +
        "," +
        tri.dexb +
        "," +
        tri.dexc +
        ")"
    );

    let wei_outputs = { input_wei, n1_wei, n2_wei, output_wei };
    let trade_outputs = { input_tokens, n1_wei, n2_wei, output_wei };
  } catch (err) {
    console.log("trade error:", token0, token1, token2);
    console.log("input", input_tokens);
    //console.log(err);
    console.log(tri);
    output_dollars = "NA";
  }
  let input_output = { input_dollars, output_dollars };
  // let trade_outputs = { n1_wei, n1, n2_wei, n2, out };
  //console.log("Profit/loss:", dollar_dollar_bills_yall);
  return input_output;
} //simulate

async function runSim(
  inputTriangles,
  outputCSV = "data/simulation.csv",
  input_dollars = "10"
) {
  let resultsArray = [];
  let naArray = [];
  let currentTime = Date.now();

  const create_stream = function (stream_file_name) {
    try {
      if (fs.existsSync(stream_file_name)) {
        var stream = fs.createWriteStream(stream_file_name, { flags: "a" });
      } else {
        //write header
        var stream = fs.createWriteStream(stream_file_name, { flags: "a" });
        stream.write(
          "time,input,output,dexa,dexb,dexc,token0,token1,token2 \n"
        );
      }
    } catch (err) {
      console.error(err);
    }
    return stream;
  };

  let all_stream = create_stream(outputCSV);
  //let profit_stream = create_stream(profit_file_name);

  let nsim = inputTriangles.length;
  let isim = 1;
  for (const tri of inputTriangles) {
    //console.log(isim, "of", nsim);
    isim = isim + 1;
    let trade_output = await simulateTrade(tri, input_dollars);

    let triOut = {
      dexa: tri.dexa,
      dexb: tri.dexb,
      dexc: tri.dexc,
      token0: tri.token0,
      token1: tri.token1,
      token2: tri.token2,
      token0_address: tri.token0_address,
      token1_address: tri.token1_address,
      token2_address: tri.token2_address,
      paira: tri.paira,
      pairb: tri.pairb,
      pairc: tri.pairc,
      input_dollars: trade_output.input_dollars,
      output_dollars: trade_output.output_dollars,
      time: Date.now()
    };

    const writerow = function (tri, trade_output, stream) {
      let currentTime = Date.now();
      stream.write(
        currentTime +
          "," +
          trade_output.input_dollars +
          "," +
          trade_output.output_dollars +
          "," +
          tri.dexa +
          "," +
          tri.dexb +
          "," +
          tri.dexb +
          "," +
          tri.token0 +
          "," +
          tri.token1 +
          "," +
          tri.token2 +
          "\n"
      );
    };

    if (trade_output.output_dollars == "NA") {
      naArray.push(triOut);
      //} else if (trade_output.output_dollars < input_dollars / 10) {
      //  loliqArray.push(triOut);
      //} else if (trade_output.output_dollars > input_dollars) {
      //  profitableArray.push(triOut);
      //  writerow(tri, trade_output, profit_stream);
    } else {
      resultsArray.push(triOut);
    }
    writerow(tri, trade_output, all_stream);
  }
  return resultsArray;
}

async function main() {
  let currentTime = Date.now();
  fs.writeFileSync(last_run_filename, currentTime.toString(), "utf8");
  console.log(Date(fs.readFileSync(last_run_filename)));
  let csv_file_name = "data/simulation" + currentTime + ".csv";
  let resultsArray = await runSim(goodTriangles, csv_file_name, "5");
  fs.writeFileSync(
    simulate_filename,
    JSON.stringify(resultsArray, undefined, 4),
    "utf8"
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  runSim: runSim
};
