// examine the text output to determine
// whether any valid triples were present.
const csv = require("csvtojson");
const csvFilePath = "data/simulation.txt";

const fs = require("fs");
let token_data = JSON.parse(fs.readFileSync("data/simulation.json"));
console.log(token_data);
//let profitable = token_data.filter((i) => i.output > i.input);
let profitable = token_data.filter((i) => i.output > 8);
console.log(profitable);

//console.log(pairContractA);

async function main() {
  const csvlib = csv();
  var tdata = await csvlib.fromFile(csvFilePath);

  //000000000000000000000000000000
  let myfilter = (i) => i.output > i.input - i.input / 2;
  let viable = tdata.filter(myfilter);

  const arr = [viable];

  let filterlq = (i) =>
    i.token0 === "LQDR" && i.token1 === "MIM" && i.token2 === "SPIRIT";
  const lms = viable.filter(filterlq);

  console.log(lms);
}

main();
