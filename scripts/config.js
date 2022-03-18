const rpc_url = "https://rpc.ftm.tools/";
//const rpc_url = "http://35.225.3.28:8545";

let factory_address = {
  spooky: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3", //,
  spirit: "0xEF45d134b73241eDa7703fa787148D9C9F4950b0",
  solid: "0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28"
};

let token_address = {
  FTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  SPIRIT: "0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
  LQDR: "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9",
  ETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  DAI: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
  SPA: "0x5602df4a94eb6c680190accfa2a475621e0ddbdc",
  WBTC: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
  CRV: "0x1E4F97b9f9F913c46F1632781732927B9019C68b",
  LINK: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8",
  SUSHI: "0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC",
  ICE: "0xf16e81dce15B08F326220742020379B855B87DF9",
  ANY: "0xdDcb3fFD12750B45d32E084887fdf1aABAb34239",
  BIFI: "0xd6070ae98b8069de6B494332d1A1a81B6179D960",
  BNB: "0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454",
  MIM: "0x82f0B8B456c1A451378467398982d4834b6829c1",
  CREAM: "0x657A1861c15A3deD9AF0B6799a195a249ebdCbc6",
  USDC: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
};

token_address = {
  FTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  SPIRIT: "0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
  LQDR: "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9"
};

//const dx = require("../src/dexes");
//token_address = dx.token_address;
//factory_address = dx.factory_address;

module.exports = {
  rpc_url: rpc_url,
  token_address: token_address,
  factory_address: factory_address
};
