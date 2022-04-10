const fs = require("fs");

//Summary

// Tokens
let tokens = JSON.parse(fs.readFileSync("data/tokens.json"));
console.log(tokens.length, "tokens");

// Pairs
let routes = JSON.parse(fs.readFileSync("data/pairs.json"));
console.log(routes.length, "routes");

// Liquid pairs
let liquid_pairs = JSON.parse(fs.readFileSync("data/validated_pairs.json"));
console.log(liquid_pairs.length, "liquid pairs");

// Routes
let routes = JSON.parse(fs.readFileSync("data/generated.json"));
console.log(routes.length, "routes");

// Profitable routes

let DETAIL = false;
if (DETAIL) {
  // Detail

  // Tokens

  // Pairs

  // Liquid pairs
  let pair_liquidity = JSON.parse(fs.readFileSync("data/pair_liquidity.json"));
  console.log(pair_liquidity.length, "liquidity");

  // Routes
  let triangles = JSON.parse(fs.readFileSync("data/generated.json"));
  console.log(triangles.length, "routes");
  triangles.forEach((element) => {
    console.log(
      element.token0,
      element.token1,
      element.token2,
      element.dexa,
      element.dexb,
      element.dexc
    );
  });
}
