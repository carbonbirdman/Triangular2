const fs = require("fs");
require("dotenv").config();
console.log(process.env.CONFIG);
const cfg = require(process.env.CONFIG);

const simulate_filename = "data/simulation2" + cfg.xpid + ".json";

function shortlist(
  inputFile = simulate_filename,
  myfilter = (i) =>
    i.output_dollars >
    parseFloat(i.input_dollars) - parseFloat(i.input_dollars) / 2
) {
  let triangles = JSON.parse(fs.readFileSync(inputFile));
  console.log(triangles.length, "attempted trades");
  let goodTriangles = triangles.filter(myfilter);
  console.log(goodTriangles);
  console.log(goodTriangles.length, "viable trades");
  return goodTriangles;
}

function save_shortlist(
  inputFile = simulate_filename,
  shortlistFile = "data/shortlist2" + cfg.xpid + ".json",
  myfilter = (i) => parseFloat(i.output_dollars) > parseFloat(i.input_dollars)
) {
  //get the shortlist
  let shortlistedSims = shortlist(inputFile, myfilter);

  // write it to file
  fs.writeFileSync(
    shortlistFile,
    JSON.stringify(shortlistedSims, undefined, 4),
    "utf8"
  );
  return shortlistFile;
}

if (require.main === module) {
  let currentTime = Date.now();
  let shortlist_filename_date = "data/shortlist2_" + currentTime + ".json";
  //const slist = save_shortlist(simulate_filename, shortlist_filename_date);
  const slist = save_shortlist(simulate_filename, shortlist_filename_date);
  console.log(slist);
}

module.exports = {
  shortlist: shortlist,
  save_shortlist: save_shortlist
};
