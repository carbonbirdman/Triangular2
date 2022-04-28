// Conditionally create token, pair and route files
require("dotenv").config();
const fs = require("fs");
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

async function tokens() {
  // tokens.json
  const tokens_filename = "data/tokens" + cfg.xpid + ".json";
  console.log(tokens_filename);
  const decimals = require("../scripts/decimals");
  const factories = require("../scripts/factories");
  try {
    if (fs.existsSync(tokens_filename)) {
      console.log("Tokens file exists.");
    } else {
      await decimals.allDecimals();
      factories.main();
    }
  } catch (err) {
    console.error(err);
  }
}
async function prices() {
  // prices.json
  const prices_filename = "data/token_price" + cfg.xpid + ".json";
  console.log(prices_filename);
  const prices = require("../scripts/prices");
  try {
    if (fs.existsSync(prices_filename)) {
      console.log("prices_filename file exists.");
    } else {
      await prices.mainPrice();
    }
  } catch (err) {
    console.error(err);
  }
}
async function pairs() {
  const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
  const pairs = require("../scripts/pairs");
  console.log(pairs_filename);
  try {
    if (fs.existsSync(pairs_filename)) {
      console.log("pairs_filename file exists.");
    } else {
      await pairs.pairsMain();
    }
  } catch (err) {
    console.error(err);
  }
}

async function reserves() {
  const reserves_filename = "data/reserves" + cfg.xpid + ".json";
  const reserves = require("../scripts/reserves");
  console.log(reserves_filename);
  try {
    if (fs.existsSync(reserves_filename)) {
      console.log("reserves_filename file exists.");
    } else {
      await reserves.main();
    }
  } catch (err) {
    console.error(err);
  }
}
async function validated() {
  const validated_pairs_filename = "data/validated_pairs" + cfg.xpid + ".json";
  const validate_pairs = require("../scripts/validate_pairs");
  console.log(validated_pairs_filename);
  try {
    if (fs.existsSync(validated_pairs_filename)) {
      console.log("validated_pairs_filename file exists.");
    } else {
      await validate_pairs.main();
    }
  } catch (err) {
    console.error(err);
  }
}

async function routes() {
  const routes_filename = "data/routes" + cfg.xpid + ".json";
  const routes = require("../scripts/generate");
  console.log(routes_filename);
  try {
    if (fs.existsSync(routes_filename)) {
      console.log("routes_filename file exists.");
    } else {
      await routes.main();
    }
  } catch (err) {
    console.error(err);
  }
}

async function routes2() {
  const routes2_filename = "data/routes2" + cfg.xpid + ".json";
  const routes_bi = require("../scripts/generate2.js");
  console.log(routes2_filename);
  try {
    if (fs.existsSync(routes2_filename)) {
      console.log("routes2_filename file exists.");
    } else {
      await routes_bi.routes_main();
    }
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await tokens();
  await prices();
  await pairs();
  await reserves();
  await validated();
  await routes();
  await routes2();
}

main();
