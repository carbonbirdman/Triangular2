// CONFIGURATION
const xpid = "test"; // experiment id
const token_abi = "../src/token.json";
const pairs_abi = "../src/pairs.json";
const factory_abi = "../src/factory.json";
const solid_factory_abi = "../src/solidFactory.json";
const solid_router_abi = "../src/solidRouter.json";
const router_abi = "../src/router.json";

const rpc_url = "https://rpc.ftm.tools/";

let factory_address = {
  spooky: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
  spirit: "0xEF45d134b73241eDa7703fa787148D9C9F4950b0",
  solid: "0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28"
};

let router_address = {
  spooky: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
  spirit: "0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52",
  solid: "0xa38cd27185a464914D3046f0AB9d43356B34829D"
};

let token_address = {
  FTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  SPIRIT: "0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
  LQDR: "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9"
};

let tokens = ["FTM", "LQDR", "SPIRIT"];
let dexs = ["spooky", "spirit", "solid"];

//const dx = require("../src/dexes");
//token_address = dx.token_address;
//factory_address = dx.factory_address;

module.exports = {
  xpid,
  token_abi,
  pairs_abi,
  factory_abi,
  solid_factory_abi,
  solid_router_abi,
  router_abi,
  tokens,
  dexs,
  rpc_url: rpc_url,
  token_address: token_address,
  router_address: router_address,
  factory_address: factory_address
};
