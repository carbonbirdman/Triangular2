const tidy = require("tidyjs");
// study the output for patterns
const fs = require("fs");
let token_data = JSON.parse(
  fs.readFileSync("data/merged_lists/merged_shortlist.json")
);
console.log(token_data);
let ftms = token_data.filter((i) => i.token0 == "FTM");
console.log(ftms.map((i) => i.token0));

//console.log(token_data.filter(obj => obj.token0 =="FTM").length);

const count = token_data.reduce((accumulator, obj) => {
  if (obj.token0 == "FTM") {
    return accumulator + 1;
  }
});

console.log(count);
//let profitable = token_data.filter((i) => i.output > 8);
//console.log(profitable);
