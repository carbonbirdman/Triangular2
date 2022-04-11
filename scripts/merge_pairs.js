// add valid pairs to a valid pairs library

const fs = require("fs");
const path = require("path");
//let directoryPath = path.join(__dirname, "data");
//directoryPath = "./data";

let pairs = JSON.parse(fs.readFileSync("data/validated_pairs.json"));
var merged = "";

if (fs.existsSync("data/valid_pair_library.json")) {
  let valid_pairs = JSON.parse(fs.readFileSync("data/valid_pair_library.json"));

  for (const pair of pairs) {
    let exists = valid_pairs.filter(function (element) {
      return (
        element.dex === pair.dex &&
        ((element.token0 === pair.token0 && element.token1 === pair.token1) ||
          (element.token0 === pair.token1 && element.token1 === pair.token0))
      ); //return
    });
    if (exists) {
      console.log("pair exists");
    }
  }
  merged = valid_pairs.concat(pairs);
  console.log(merged.length);
} else {
  merged = pairs;
  console.log(merged.length);
}

fs.writeFileSync(
  "data/valid_pair_library.json",
  JSON.stringify(merged, undefined, 4),
  "utf8"
);
