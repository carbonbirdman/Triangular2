const fs = require("fs");
let vpairs = JSON.parse(fs.readFileSync("data/validated_pairs.json"));
let apairs = JSON.parse(fs.readFileSync("data/all_pairs.json"));
let reserves = JSON.parse(fs.readFileSync("data/reserves.json"));

let allPairs = {
  ...vpairs,
  ...reserves
};

console.log(allPairs);
let pair_string = JSON.stringify(allPairs, undefined, 4);
fs.writeFileSync("data/mergable.json", pair_string, "utf8");
