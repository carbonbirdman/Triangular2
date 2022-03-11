const axios = require("axios");

const cg_url =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

axios
  .get(cg_url)
  .then((res) => {
    //console.log(res.data);
    console.log(res.data.filter((r) => r.id == "cardano"));
  })
  .catch((error) => console.log(error));



stream.write(
  input+
  token0+
  dexa,
  n1,
  token1,
  dexb,
  n2,
  token2,
  dexc,
  output + "\n"
);


factory_contracts[dex] = new ethers.Contract(
  factory_address[dex],
  factoryABI,
  conn
);

let pair_address = await factory_contract.getPair(
  dx.token_address[token0],
  dx.token_address[token1]
);


triPrices.push({
  dexa,
  dexb,
  dexc,
  token0,
  token1,
  token2,
  reserves_pricea,
  reserves_priceb,
  reserves_pricec
});
} catch (err) {
//return reserves;
console.log("Error obtaining reserves");
const [dexa, dexb, dexc] = [tri.dexa, tri.dexb, tri.dexc];
const [token0, token1, token2] = [tri.token0, tri.token1, tri.token2];
const [reserves_pricea, reserves_priceb, reserves_pricec] = [
  "NA",
  "NA",
  "NA"
];
triPrices.push({
  dexa,
  dexb,
  dexc,
  token0,
  token1,
  token2,
  reserves_pricea,
  reserves_priceb,
  reserves_pricec
});
}
}
} //main

async function main() {
const triPrices = getTriPrice();
console.log(triPrices);
}
