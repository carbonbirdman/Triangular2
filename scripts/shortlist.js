const fs = require("fs");

function shortlist(
  inputFile = "data/trade_pairs.json",
  myfilter = (i) =>
    i.output_dollars >
    parseFloat(i.input_dollars) - parseFloat(i.input_dollars) / 2
) {
  let triangles = JSON.parse(fs.readFileSync(inputFile));
  console.log(triangles);
  triangles.forEach((element) => {
    console.log(element.output_dollars);
  });
  //const asArray = Object.entries(triangles);
  //console.log(asArray[0]);
  // let filtered = asArray[0].filter(myfilter);
  //console.log(filtered);
  //const goodTriangles = Object.fromEntries(filtered);
  let goodTriangles = triangles.filter(myfilter);
  return goodTriangles;
}

async function save_shortlist(
  inputFile = "data/simulation.json",
  myfilter = (i) => i.output > i.input - i.input / 2
) {
  let goodTriangles = shortlist(inputFile, myfilter);
  let shortlist_filename = "data/shortlist.json";
  fs.writeFileSync(shortlist_filename, JSON.stringify(goodTriangles), "utf8");
  return shortlist_filename;
}

if (require.main === module) {
  const slist = shortlist();
  console.log(slist);
}

module.exports = {
  shortlist: shortlist,
  save_shortlist: save_shortlist
};
