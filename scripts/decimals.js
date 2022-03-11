const ethers = require("ethers");
var rpc_url = "https://rpc.ftm.tools/";
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
console.log("Starting up decimal script");
const dx = require("../src/dexes");
const fs = require("fs");
const tokenABI = require("../src/token.json");

const cfg = require("./config");
let token_address = cfg.token_address;

let tokens = Object.keys(token_address);
var tokenArray = [];

async function getDecimals() {
  try {
    for (const token of tokens) {
      console.log(token);
      const token_contract = new ethers.Contract(
        token_address[token],
        tokenABI,
        conn
      );
      const token_decimal = await token_contract.decimals();
      tokenArray.push({
        symbol: token,
        address: token_address[token],
        decimal: token_decimal
      });
    } //for

    return tokenArray;
  } catch (err) {
    console.log(err);
  }
} //mget

async function main() {
  getDecimals().then((tokens) => {
    //console.log(allpairs);
    let token_string = JSON.stringify(tokens);
    fs.writeFileSync("data/tokens.json", token_string, "utf8");
  });
}

main();
