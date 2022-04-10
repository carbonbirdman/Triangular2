const express = require("express");
const dx = require("./src/dexes");
const sl = require("./scripts/shortlist");
const sim = require("./scripts/simulate_solid");
var path = require("path");
const fs = require("fs");

const app = express();
var eta = require("eta");
app.set("view engine", "eta");

const port = 3000;

// INDEX PAGE
var indexTemplate = `
<!DOCTYPE html>
<p>Triangular arbitrage search.</p>
<p><a href="/simulate">RUN SEARCH</a></p>
<% it.forEach(function(item){ %>
  <a href=" <%= item %> "><%= item %> </a>
  <a href="<%= item %>/json">[json]</a></br>
<% }) %>
`;

app.get("/", (req, res) => {
  res.send(
    eta.render(indexTemplate, [
      "tokens",
      "price",
      "pairs",
      "validpairs",
      "routes",
      "simulation",
      "shortlist"
    ])
  );
});

//TOKENS
var tokensTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
<li> <%= entry.symbol%> <%= entry.decimal%> <%= entry.address%> 
</li>
<%});%>
</ul>
`;

app.get("/tokens", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/tokens.json"));
  res.send(eta.render(tokensTemplate, items));
});

app.get("/tokens/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync("data/tokens.json")));
});

//PRICE
var tokenPriceTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
<li> <%= entry.token%> <%= entry.usdPrice.toPrecision(3)%>
</li>
<%});%>
</ul>
`;

app.get("/price", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/token_price.json"));
  res.send(eta.render(tokenPriceTemplate, items));
});

app.get("/price/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync("data/token_price.json")));
});

//ALLPAIRS
var pairsTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
  <li>
<%= entry.token0%>/
<%= entry.token1%>
, <%= entry.dex%> 
</li>
<%});%>
</ul>
`;

app.get("/pairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/all_pairs.json"));
  console.log(items);
  res.send(eta.render(pairsTemplate, items));
});

app.get("/pairs/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync("data/all_pairs.json")));
});

//VALID PAIRS
var validPairsTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>

<% it.forEach(function(entry) {%>
  <li>
<%= entry.token0%>/
<%= entry.token1%>, 
<%= entry.dex%>
$<%= parseFloat(entry.input_dollars).toPrecision(3)%> ->
$<%= parseFloat(entry.output_dollars).toPrecision(3)%> 
</li>
<%});%>
</ul>
`;

app.get("/validpairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/validated_pairs.json"));
  res.send(eta.render(validPairsTemplate, items));
});

app.get("/validpairs/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync("data/validated_pairs.json")));
});

// ROUTES
var routesTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
  <li>
  (<%= entry.token0%>,
    <%= entry.token1%>,
    <%= entry.token2%>)
    (<%= entry.dexa%>,
    <%= entry.dexb%>,
    <%= entry.dexc%>)
</li>
<%});%>
</ul>
`;

app.get("/routes", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/routes.json"));
  res.send(eta.render(routesTemplate, items));
});

app.get("/routes/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync("data/routes.json")));
});

//SIMULATION
var simTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
<li> <%= entry.input_dollars%> -> <%= entry.output_dollars.toPrecision(3)%> 
(<%= entry.token0%>,
<%= entry.token1%>,
<%= entry.token2%>)
(<%= entry.dexa%>,
<%= entry.dexb%>,
<%= entry.dexc%>)
</li>
<%});%>
</ul>
`;

app.get("/simulation", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/simulation.json"));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/shortlist", function (req, res) {
  let items = sl.shortlist(
    "data/simulation.json",
    (i) => i.output > i.input - i.input / 10
  );
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

async function runsim(req, res) {
  let goodTriangles = JSON.parse(fs.readFileSync("data/generated.json"));
  await sim.simLoop(goodTriangles);
  let items = JSON.parse(fs.readFileSync("data/simulation.json"));
  res.send(eta.render(simTemplate, items));
  return items;
}

// RUN SCRIPTS
app.get("/simulate", function (req, res) {
  try {
    let items = runsim(req, res);
    console.log(items);
  } catch (err) {
    let items = { error: "error" };
    console.log(items);
    res.send(eta.render(simTemplate, items));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  //var conn = dexes.get_connection();
  console.log(dx.token_address);
});
