const el = require("../src/elements");
const dx = require("../src/dexes");
//const pricey = el.getPriceSimple();
//console.log(pricey);
const token0_symbol = "FTM";
const token1_symbol = "WBTC";
const token0_address = dx.token_address[token0_symbol];
const token1_address = dx.token_address[token1_symbol];
const eth_in = "1";
var dex_ask = "spooky";
var dex_bid = "spirit";
//const factory = dx.factory_address[dex];
//const router = dx.router_address[dex];

var conn = dx.get_connection();

let swap_request = {
  eth_in,
  dex_ask,
  dex_bid,
  token0_symbol,
  token1_symbol,
  token0_address,
  token1_address,
  conn
};

test("get swap price", () => {
  expect(el.getSwapPrice(swap_request)).toBeDefined();
});

test("get price dumb", () => {
  expect(el.getPriceDumb()).toBeDefined();
});
