const fs = require("fs");
let token_data = JSON.parse(fs.readFileSync("data/simulation.json"));
console.log(token_data);
//let profitable = token_data.filter((i) => i.output > i.input);
let profitable = token_data.filter((i) => i.output > 8);
console.log(profitable);

//console.log(pairContractA);
