// Produces "data/tokens.json"
const ethers = require("ethers");
const fs = require("fs");

const dx = require("../src/dexes");
const tokenABI = require("../src/token.json");

const cfg = require("./config");
let token_address = cfg.token_address;
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);

let tokens = Object.keys(token_address);
var tokenArray = [];

console.log("Starting up token info script ...");

async function getDecimals() {
  try {
    for (const token of tokens) {
      const token_contract = new ethers.Contract(
        token_address[token],
        tokenABI,
        conn
      );
      const token_decimal = await token_contract.decimals();
      console.log(token, token_decimal);
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

async function allDecimals() {
  getDecimals().then((tokens) => {
    //console.log(allpairs);
    let token_string = JSON.stringify(tokens);
    fs.writeFileSync("data/tokens.json", token_string, "utf8");
  });
}
if (require.main === module) {
  allDecimals();
}
