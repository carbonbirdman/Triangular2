// append a shortlist to another shortlist file
const fs = require("fs");

function merge_shortlist(
  shortlist_filename = "data/shortlist.json",
  merged_filename = "data/merged_shortlist.json"
) {
  let json1 = JSON.parse(fs.readFileSync(shortlist_filename));
  var merged = "";
  console.log(json1.length);
  if (fs.existsSync(merged_filename)) {
    let json2 = JSON.parse(fs.readFileSync(merged_filename));
    merged = json1.concat(json2);
    console.log(json2.length);
    console.log(merged.length);
  } else {
    merged = json1;
  }

  fs.writeFileSync(
    merged_filename,
    JSON.stringify(merged, undefined, 4),
    "utf8"
  );

  fs.unlinkSync(shortlist_filename);
}

if (require.main === module) {
  let currentTime = Date.now();
  let shortlist_filename_current = "data/shortlist.json";
  let merged_filename_date = "data/merged_shortlist_" + currentTime + ".json";
  merge_shortlist(shortlist_filename_current, merged_filename_date);
}

module.exports = {
  merge_shortlist
};
