// merge into aggregated shortlist

const fs = require("fs");
//requiring path and fs modules
const path = require("path");
//joiing path of directory
let directoryPath = path.join(__dirname, "data");
directoryPath = "./data";

async function main() {
  let merged = [];
  let files = fs.readdirSync(directoryPath);
  let filteredFiles = files
    .filter(
      (fileName) =>
        fileName.startsWith("shortlist") & fileName.endsWith(".json")
    )
    .map((fileName) => {
      merged = merged.concat(
        JSON.parse(fs.readFileSync(directoryPath + "/" + fileName))
      );
      console.log(merged.length);
    });

  console.log(merged);

  fs.writeFileSync(
    "data/merged_shortlists.json",
    JSON.stringify(merged, undefined, 4),
    "utf8"
  );
}

main();
