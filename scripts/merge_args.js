const fs = require("fs");
const yargs = require("yargs");

const argv = yargs
  .option("file1", {
    description: "file1",
    alias: "1",
    type: "string"
  })
  .option("file2", {
    description: "file2",
    alias: "2",
    type: "string"
  });

if (argv.file1) {
  var inputFile1 = argv.file;
  console.log("Input file: ", infile);
}

if (argv.file2) {
  var inputFile2 = argv.file;
  console.log("Input file: ", infile);
}

let json1 = JSON.parse(fs.readFileSync(inputFile1));
let json2 = JSON.parse(fs.readFileSync(inputFile2));

let merged = json1.concat(json2);

console.log(json1.length);
console.log(json2.length);
console.log(merged.length);

fs.writeFileSync(
  "data/merged.json",
  JSON.stringify(merged, undefined, 4),
  "utf8"
);
