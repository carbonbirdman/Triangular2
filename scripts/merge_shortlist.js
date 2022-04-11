const fs = require("fs");

let json1 = JSON.parse(fs.readFileSync("data/shortlist.json"));
var merged = "";
console.log(json1.length);
if (fs.existsSync("data/merged_shortlist.json")) {
  let json2 = JSON.parse(fs.readFileSync("data/merged_shortlist.json"));
  merged = json1.concat(json2);
  console.log(json2.length);
  console.log(merged.length);
} else {
  merged = json1;
}

fs.writeFileSync(
  "data/merged_shortlist.json",
  JSON.stringify(merged, undefined, 4),
  "utf8"
);
