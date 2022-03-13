const csv = require("csvtojson");
const csvFilePath = "data/simulation.txt";

async function main() {
  const csvlib = csv();
  var tdata = await csvlib.fromFile(csvFilePath);
  let myfilter = (i) => i.output > i.input - i.input / 2;
  let viable = tdata.filter(myfilter);

  const arr = [viable];

  let filterlq = (i) =>
    i.token0 === "LQDR" && i.token1 === "MIM" && i.token2 === "SPIRIT";
  const lms = viable.filter(filterlq);

  console.log(lms);
}

main();
