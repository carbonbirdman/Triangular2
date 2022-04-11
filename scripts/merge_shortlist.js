const fs = require("fs");

let json1 = JSON.parse(fs.readFileSync("data/shortlist.json"));
let json2 = JSON.parse(fs.readFileSync("data/merged_shortlist.json"));

let merged = json1.concat(json2);

console.log(json1.length);
console.log(json2.length);
console.log(merged.length);

fs.writeFileSync(
  "data/merged_shortlist.json",
  JSON.stringify(merged, undefined, 4),
  "utf8"
);
