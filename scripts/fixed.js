const ethers = require("ethers");

const input = "1";
const fixed = ethers.FixedNumber.fromString(input);
console.log(fixed._value);
const decimal = "18";
const wei = ethers.utils.parseUnits(input, decimal);
console.log(wei);
const eth = ethers.utils.formatUnits(wei, decimal);
console.log(eth);
