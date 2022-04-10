const fs = require("fs");

function shortlist(
  inputFile = "data/trade_pairs.json",
  myfilter = (i) =>
    i.output_dollars >
    parseFloat(i.input_dollars) - parseFloat(i.input_dollars) / 2
) {
  let triangles = JSON.parse(fs.readFileSync(inputFile));
  console.log(triangles.length, "attempted trades");
  //triangles.forEach((element) => {
  // console.log(element.output_dollars);
  //});
  //const asArray = Object.entries(triangles);
  //console.log(asArray[0]);
  // let filtered = asArray[0].filter(myfilter);
  //console.log(filtered);
  //const goodTriangles = Object.fromEntries(filtered);
  let goodTriangles = triangles.filter(myfilter);
  console.log(goodTriangles);
  console.log(goodTriangles.length, "viable trades");
  return goodTriangles;
}

function save_shortlist(
  inputFile = "data/simulation.json",
  myfilter = (i) => parseFloat(i.output_dollars) > parseFloat(i.input_dollars)
) {
  let goodTriangles = shortlist(inputFile, myfilter);
  let currentTime = Date.now();
  let shortlist_filename = "data/shortlist_" + currentTime + ".json";
  fs.writeFileSync(
    "data/shortlist.json",
    JSON.stringify(goodTriangles, undefined, 4),
    "utf8"
  );
  fs.writeFileSync(
    shortlist_filename,
    JSON.stringify(goodTriangles, undefined, 4),
    "utf8"
  );
  return shortlist_filename;
}

if (require.main === module) {
  const slist = save_shortlist();
  console.log(slist);
}

module.exports = {
  shortlist: shortlist,
  save_shortlist: save_shortlist
};
