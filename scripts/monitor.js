const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const factoryABI = require("../src/factory.json");
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Monitor starting up");

const dx = require("../src/dexes");
const pairABI = require("../src/pairs.json");
const fs = require("fs");

const cfg = require("./config");
let token_address = cfg.token_address;
let factory_address = cfg.factory_address;
//let token_address = dx.token_address;
//let factory_address = dx.factory_address;

var tokens = Object.keys(token_address);
var dexes = Object.keys(factory_address);

let triangles = JSON.parse(fs.readFileSync("data/triangular.json"));
console.log(triangles);
let token_data = JSON.parse(fs.readFileSync("data/tokens.json"));
//console.log(token_data);

async function getTriPrice(input = "1") {
  var resultsArray = [];
  var stream = fs.createWriteStream("trice.txt", { flags: "a" });
  for (const tri of triangles) {
    //console.log(tri);
    //console.log("TRI");
    const [dexa, dexb, dexc] = [tri.dexa, tri.dexb, tri.dexc];
    const [token0, token1, token2] = [tri.token0, tri.token1, tri.token2];

    const token0_data = token_data.filter((i) => i.symbol === tri.token0);
    const token1_data = token_data.filter((i) => i.symbol === tri.token1);
    const token2_data = token_data.filter((i) => i.symbol === tri.token2);
    //console.log(token0_data);

    const token0_decimal = token0_data[0].decimal;
    const token1_decimal = token1_data[0].decimal;
    const token2_decimal = token2_data[0].decimal;
    //console.log("decimal", token0_decimal);

    console.log(tri.paira);

    let pairContractA = new ethers.Contract(tri.paira, pairABI, conn);
    let pairContractB = new ethers.Contract(tri.pairb, pairABI, conn);
    let pairContractC = new ethers.Contract(tri.pairc, pairABI, conn);
    let [posa, posb, posc] = [3, 3, 3];

    //console.log("TRI");
    //console.log(pairContractA);
    try {
      const reservesA = await pairContractA.getReserves();
      const A0_address = await pairContractA.token0();
      const A1_address = await pairContractA.token1();
      //console.log(A0_addres, tri.token1_address);
      if (A0_address === ethers.utils.getAddress(tri.token0_address)) {
        posa = 0;
        var factora =
          Math.pow(10, token0_decimal) / Math.pow(10, token1_decimal);
        var reserves_pricea = reservesA[1] / reservesA[0]; // factora;
      } else if (A1_address === ethers.utils.getAddress(tri.token0_address)) {
        posa = 1; //console.log("0 a second");
        var factora =
          Math.pow(10, token1_decimal) / Math.pow(10, token0_decimal);
        var reserves_pricea = reservesA[0] / reservesA[1]; //* factora;
      } else {
        console.log("Error matching eth equivalent");
        continue;
      }

      const reservesB = await pairContractB.getReserves();
      const B0_address = await pairContractB.token0();
      const B1_address = await pairContractB.token1();
      if (B0_address === ethers.utils.getAddress(tri.token1_address)) {
        //console.log("0 b first");
        posb = 0;
        var factorb =
          Math.pow(10, token1_decimal) / Math.pow(10, token2_decimal);
        var reserves_priceb = reservesB[1] / reservesB[0]; // factorb;
      } else if (B1_address === tri.token1_address) {
        //console.log("0 b second");
        posb = 1;
        var factorb =
          Math.pow(10, token2_decimal) / Math.pow(10, token1_decimal);
        reserves_priceb = reservesB[0] / reservesB[1]; //* factorb;
      } else {
        console.log("Error matching eth equivalent");
        continue;
      }

      const reservesC = await pairContractC.getReserves();
      const C0_address = await pairContractC.token0();
      const C1_address = await pairContractC.token1();
      if (C0_address === ethers.utils.getAddress(tri.token2_address)) {
        //console.log("0 c first");
        posc = 0;
        var factorc =
          Math.pow(10, token2_decimal) / Math.pow(10, token0_decimal);
        var reserves_pricec = reservesC[1] / reservesC[0]; // factorc;
      } else if (C1_address === ethers.utils.getAddress(tri.token2_address)) {
        //console.log("0 c second");
        posc = 1;
        var factorc =
          Math.pow(10, token0_decimal) / Math.pow(10, token2_decimal);
        reserves_pricec = reservesC[0] / reservesC[1]; //* factorc;
      } else {
        console.log("Error matching eth equivalent");
        continue;
      }

      const input_gwei = ethers.utils.parseUnits(input, token0_decimal);
      const n1_wei = input_gwei * reserves_pricea;
      const n1 = n1_wei * Math.pow(10, -token1_decimal);
      const n2_wei = n1_wei * reserves_priceb;
      const n2 = n2_wei * Math.pow(10, -token2_decimal);
      const out = n2_wei * reserves_pricec;
      //const output = out.toString();
      //console.log("output", output);
      //const eth_out = ethers.utils.formatUnits(output, token0_decimal);
      const output = out * Math.pow(10, -token0_decimal);
      console.log(
        token0,
        dexa,
        token1,
        dexb,
        token2,
        dexc,
        token0,
        posa,
        posb,
        posc,
        "|",
        factora,
        factorb,
        factorc
      );
      console.log(
        input,
        n1.toPrecision(3),
        n2.toPrecision(3),
        output.toPrecision(3)
      );

      resultsArray.push({
        dexa: dexa,
        dexb: dexb,
        dexc: dexc,
        token0: token0,
        token1: token1,
        token2: token2,
        token0_address: tri.token0_address,
        token1_address: tri.token1_address,
        token2_address: tri.token2_address,
        paira: tri.paira,
        pairb: tri.pairb,
        pairc: tri.pairc,
        input: input,
        n1: n1,
        n2: n2,
        output: output
      });

      //console.log("TRI");
      console.log(dexa, token0, dexb, token1, dexc, token2);
      stream.write(
        input +
          " " +
          token0 +
          " " +
          dexa +
          " " +
          n1 +
          " " +
          token1 +
          " " +
          dexb +
          " " +
          n2 +
          " " +
          token2 +
          " " +
          dexc +
          " " +
          output +
          "\n"
      );
    } catch (err) {
      const out = "NA";
      console.log("err");
      console.log(err);
      //console.log(input, out);
    }
  } //for
  console.log("Done");
  stream.end();
  let token_string = JSON.stringify(resultsArray);
  fs.writeFileSync("data/trikes.json", token_string, "utf8");
} //getTriPrice

async function main() {
  getTriPrice("1");
}

main();

//token_data
//tokenArray.push({
//  symbol: token,
//  address: token_address[token],
//  decimal: token_decimal
//});

//triangle data
//dexa: 'spirit',
//dexb: 'spirit',
//dexc: 'spirit',
//token0: 'SPIRIT',
//token1: 'LQDR',
//token2: 'FTM',
//paira: '0xFeBbfeA7674720cEdD35e9384d07F235365c1B3e',
//pairb: '0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2',
//pairc: '0x30748322B6E34545DBe0788C421886AEB5297789'
//dexa: 'spirit',
//dexb: 'spirit',
//dexc: 'spirit',
//token0: 'SPIRIT',
//token1: 'LQDR',
//token2: 'FTM',
//paira: '0xFeBbfeA7674720cEdD35e9384d07F235365c1B3e',
//pairb: '0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2',
//pairc: '0x30748322B6E34545DBe0788C421886AEB5297789'
