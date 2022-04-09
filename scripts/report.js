const fs = require("fs");

var infile = "data/generated.json";
let triangles = JSON.parse(fs.readFileSync(infile));
console.log(triangles.length, "routes");
triangles.forEach((element) => {
  console.log(
    element.token0,
    element.token1,
    element.token2,
    element.dexa,
    element.dexb,
    element.dexc
  );
});
