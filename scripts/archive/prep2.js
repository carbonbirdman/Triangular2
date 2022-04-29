// Conditionally create token, pair and route files
require("dotenv").config();
const fs = require("fs");
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);
const tokens_filename = "data/tokens" + cfg.xpid + ".json";
console.log(tokens_filename);

var pairs_exists = false;

async function dopairs() {
  console.log(pairs_exists);
  return new Promise(function (resolve, reject) {
    try {
      if (pairs_exists) {
        console.log("pairs_filename file exists.");
        setTimeout(function () {
          console.log("reserves");
        }, 1000);
        resolve(pairs_exists);
      } else {
        setTimeout(function () {
          console.log("doing pairs");
          pairs_exists = true;
          resolve(pairs_exists);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      reject(new Error(`pair error`));
    }
  });
}

async function reserves() {
  if (pairs_exists) {
    setTimeout(function () {
      console.log("reserves");
    }, 3000);
  } else {
    console.log("big error");
  }
}

async function main() {
  //dopairs().then(reserves(), console.log("err"));
  await dopairs();
  reserves();
}

main();
