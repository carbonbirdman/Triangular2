// Produces "data/tokens.json"
const ethers = require("ethers");
const fs = require("fs");

require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);
let token_address = cfg.token_address;
let rpc_url = cfg.rpc_url;
const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const tokenABI = require(cfg.token_abi);
const tokens = cfg.tokens;

const tokens_filename = "data/tokens" + cfg.xpid + ".json";
var tokenArray = [];

console.log(tokens);
console.log("Starting up token info script ...");

async function getDecimals(tokens) {
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
  getDecimals(tokens).then((token_out) => {
    //console.log(allpairs);
    let token_string = JSON.stringify(token_out, undefined, 4);
    fs.writeFileSync(tokens_filename, token_string, "utf8");
  });
}
if (require.main === module) {
  allDecimals();
}

module.exports = {
  allDecimals
};
