const express = require("express");
const dx = require("./src/dexes");
const sl = require("./scripts/shortlist");
const sim = require("./scripts/simulate");
var path = require("path");
const fs = require("fs");
const cfg = require("./scripts/config");

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
      "shortlist",
      "merged_shortlist"
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

const tokens_filename = "data/tokens" + cfg.xpid + ".json";

app.get("/tokens", function (req, res) {
  let items = JSON.parse(fs.readFileSync(tokens_filename));
  res.send(eta.render(tokensTemplate, items));
});

app.get("/tokens/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(tokens_filename)));
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
const prices_filename = "data/token_price.json";
app.get("/price", function (req, res) {
  let items = JSON.parse(fs.readFileSync(prices_filename));
  res.send(eta.render(tokenPriceTemplate, items));
});

app.get("/price/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(prices_filename)));
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
const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
app.get("/pairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync(pairs_filename));
  console.log(items);
  res.send(eta.render(pairsTemplate, items));
});

app.get("/pairs/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(pairs_filename)));
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
const validated_pairs_filename = "data/validated_pairs.json";
app.get("/validpairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync(validated_pairs_filename));
  res.send(eta.render(validPairsTemplate, items));
});

app.get("/validpairs/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(validated_pairs_filename)));
});

//RESERVES
var reservesTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
  <li>
<%= entry.token0%>/
<%= entry.token1%>, 
<%= entry.dex%>
$<%= parseFloat(entry.reserves0).toPrecision(3)%> ->
$<%= parseFloat(entry.reserves1).toPrecision(3)%> 
</li>
<%});%>
</ul>
`;

const reserves_filename = "data/reserves" + cfg.xpid + ".json";
app.get("/reserves", function (req, res) {
  let items = JSON.parse(fs.readFileSync(reserves_filename));
  res.send(eta.render(reservesTemplate, items));
});

app.get("/reserves/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(reserves_filename)));
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
const routes_filename = "data/routes.json";
app.get("/routes", function (req, res) {
  let items = JSON.parse(fs.readFileSync(routes_filename));
  res.send(eta.render(routesTemplate, items));
});

app.get("/routes/json", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(routes_filename)));
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
const simulate_filename = "data/simulation.json";
app.get("/simulation", function (req, res) {
  let items = JSON.parse(fs.readFileSync(simulate_filename));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/shortlist", function (req, res) {
  let items = sl.shortlist(
    simulate_filename,
    (i) => i.output > i.input - i.input / 10
  );
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/mergedlist", function (req, res) {
  let items = JSON.parse(fs.readFileSync("data/merged_shortlist.json"));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

async function runsim(req, res) {
  let goodTriangles = JSON.parse(fs.readFileSync(routes_filename));
  await sim.runSim(goodTriangles);
  let items = JSON.parse(fs.readFileSync(simulate_filename));
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
  console.log(cfg.tokens);
  console.log(cfg.dexes);
});
