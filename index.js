const express = require("express");
const dx = require("./src/dexes");
const sl = require("./scripts/shortlist");
const sim = require("./scripts/simulate");
var path = require("path");
const fs = require("fs");
const https = require("https");
const cors = require('cors');

require("dotenv").config();
console.log("Config:", process.env.CONFIG_WEB);
const cfg = require(process.env.CONFIG_WEB);
console.log("xp", cfg.xpid);

//const prep = require("./scripts/prep");
//await prep.main();

const app = express();
var eta = require("eta");
app.set("view engine", "eta");
//app.use(cors());

const port = (process.env.PORT || 3000);
const HTTPS = false;

if (HTTPS) {
https.createServer(
{key: fs.readFileSync("server.key"),
 cert: fs.readFileSync("server.cert"),
},
    app
    )
    .listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(cfg.tokens);
});
} else {
//must keep this code
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(dx.token_address);
});
}


const tokens_filename = "data/tokens" + cfg.xpid + ".json";
const prices_filename = "data/token_price" + cfg.xpid + ".json";
const pairs_filename = "data/all_pairs" + cfg.xpid + ".json";
const validated_pairs_filename = "data/validated_pairs" + cfg.xpid + ".json";
const reserves_filename = "data/reserves" + cfg.xpid + ".json";
const routes_filename = "data/routes" + cfg.xpid + ".json";
const routes2_filename = "data/routes2" + cfg.xpid + ".json";
const simulate_filename = "data/simulation" + cfg.xpid + ".json";
var merged_filename = "data/merged_shortlist_" + cfg.xpid + ".json";
var merged2_filename = "data/merged_shortlist2_" + cfg.xpid + ".json";
const last_run_filename = "data/last_run" + cfg.xpid + ".txt";

// INDEX PAGE
var indexTemplate = `
<!DOCTYPE html>
<h1>Kestrel</h1>
<p>Welcome to Kestrel, a service for defi arbitrage search and modelling.</p>
<p>Current experiment ID: <%= it.xp %></p>
<p>Kestrel currently searches basic and triangular opportunities.</p>
<p>On this page you can examine the merged shortlist of profitable 
trades assessed hourly, look up the pool reserves and IDs for 
valid pairs, and even <a href="/simulate">run a search</a>
 in real time (results will replace 'simulation'
and be added to 'merged shortlist' below)</p>
<% it.links.forEach(function(item){ %>
  <a href=" <%= item %> "><%= item %> </a>
  <a href="<%= item %>/json">[json]</a></br>
<% }) %>
<p>To execute the opportunities identified here, 
use my <b>Farrier</b> package, available via Github.</p>
`;

app.get("/", (req, res) => {
  res.send(
    eta.render(indexTemplate, {
      xp: cfg.xpid,
      links: [
        "tokens",
        "price",
        "pairs",
        "validpairs",
        "routes2",
        "routes",
        "simulation",
        "shortlist",
        "merged_shortlist",
        "merged_shortlist2",
        "hourly_shortlist",
        "hourly_shortlist_basic"
      ]
    })
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
  let items = JSON.parse(fs.readFileSync(tokens_filename));
  res.send(eta.render(tokensTemplate, items));
});

app.get("/tokens/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
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

app.get("/price", function (req, res) {
  let items = JSON.parse(fs.readFileSync(prices_filename));
  res.send(eta.render(tokenPriceTemplate, items));
});

app.get("/price/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
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

app.get("/pairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync(pairs_filename));
  console.log(items);
  res.send(eta.render(pairsTemplate, items));
});

app.get("/pairs/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
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

app.get("/validpairs", function (req, res) {
  let items = JSON.parse(fs.readFileSync(validated_pairs_filename));
  res.send(eta.render(validPairsTemplate, items));
});

app.get("/validpairs/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
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

app.get("/reserves", function (req, res) {
  let items = JSON.parse(fs.readFileSync(reserves_filename));
  res.send(eta.render(reservesTemplate, items));
});

app.get("/reserves/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
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

app.get("/routes", function (req, res) {
  let items = JSON.parse(fs.readFileSync(routes_filename));
  res.send(eta.render(routesTemplate, items));
});

app.get("/routes/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(routes_filename)));
});

// ROUTES2
var routes2Template = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
  <li>
  (<%= entry.token0%>,
    <%= entry.token1%>,
    (<%= entry.dexa%>,
    <%= entry.dexb%>
</li>
<%});%>
</ul>
`;

app.get("/routes2", function (req, res) {
  let items = JSON.parse(fs.readFileSync(routes2_filename));
  res.send(eta.render(routes2Template, items));
});

app.get("/routes2/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(routes2_filename)));
});

let currentTime = Date.now();
let dtime = Date(currentTime);
console.log(dtime);
const d = new Date(currentTime);
let text = d.toISOString();
console.log(text);
//SIMULATION
var simTemplate = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
<li> 
<%= new Date(entry.time).toISOString().substring(1,10)%> 
<%= entry.input_dollars%> -> <%= entry.output_dollars.toPrecision(3)%> 
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

var sim2Template = `
<!DOCTYPE html>
<a href="/">home</a>
<ul>
<% it.forEach(function(entry) {%>
<li> 
<%= new Date(entry.time).toISOString().substring(1,10)%> 
<%= entry.input_dollars%> -> <%= entry.output_dollars.toPrecision(3)%> 
(<%= entry.token0%>,
<%= entry.token1%>
(<%= entry.dexa%>,
<%= entry.dexb%>
</li>
<%});%>
</ul>
`;

app.get("/simulation", function (req, res) {
  let items = JSON.parse(fs.readFileSync(simulate_filename));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/simulation/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(simulate_filename)));
});

app.get("/shortlist", function (req, res) {
  let items = sl.shortlist(
    simulate_filename,
    (i) => i.output > i.input - i.input / 10
  );
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/merged_shortlist", function (req, res) {
  let items = JSON.parse(fs.readFileSync(merged_filename));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/merged_shortlist/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(merged_filename)));
});

// MERGED2
app.get("/merged_shortlist2", function (req, res) {
  let items = JSON.parse(fs.readFileSync(merged2_filename));
  console.log(items);
  res.send(eta.render(sim2Template, items));
});

app.get("/merged_shortlist2/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(merged2_filename)));
});

// Run interactively
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

const simulate = require("./scripts/simulate");
const shortlist = require("./scripts/shortlist");
const merge_shortlist = require("./scripts/merge_shortlist");
var sim_csv_filename = "data/simulation2.csv";
var merged_filename_hourly =
  "data/merged_shortlist_" + cfg.xpid + "_hourly.json";
// This function runs a trade sim against the routes for the
// selected config. The simulation file is overwritten, the shortlist
// file is merged.
async function runJob() {
  var infile = "data/routes" + cfg.xpid + ".json";
  let routes = JSON.parse(fs.readFileSync(infile));
  let currentTime = Date.now();
  var sim_filename_hourly = "data/sim_" + cfg.xpid + "_hourly.json";
  console.log("routes:" + infile);
  var resultsArray = await simulate.runSim(routes, sim_csv_filename, "10");
  fs.writeFileSync(sim_filename_hourly, JSON.stringify(resultsArray), "utf8");
  var shortlist_filename_hourly =
    "data/shortlist" + "_" + cfg.xpid + "_" + currentTime + ".json";
  shortlist.save_shortlist(sim_filename_hourly, shortlist_filename_hourly);
  merge_shortlist.merge_shortlist(
    shortlist_filename_hourly,
    merged_filename_hourly
  );
  //fs.unlinkSync(shortlist_filename_hourly);
  console.log("Hourly simulation done and shortlisted.");
}

// TRIANGULAR HOURLY
const cron = require("node-cron");
cron.schedule("7 02 * * * *", () => {
  console.log("running a task every hour");
  runJob();
});

app.get("/hourly_shortlist", function (req, res) {
  let items = JSON.parse(fs.readFileSync(merged_filename_hourly));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.get("/hourly_shortlist/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(merged_filename_hourly)));
});

// SIMPLE HOURLY
cron.schedule("7 30 * * * *", () => {
  console.log("running a task every hour");
  runJob2();
});

// SIMPLE MINUTELY
//cron.schedule("7 * * * * *", () => {
//  console.log("running a task every hour");
//  runJob2();
//});

const simulate2 = require("./scripts/simulate2");
const shortlist2 = require("./scripts/shortlist2");
var sim_csv_filename = "data/simulation2.csv";
var merged_filename_hourly2 =
  "data/merged_shortlistx2_" + cfg.xpid + "_hourly.json";

app.get("/hourly_shortlist_basic", function (req, res) {
  let items = JSON.parse(fs.readFileSync(merged_filename_hourly2));
  console.log(items);
  res.send(eta.render(sim2Template, items));
});

app.get("/hourly_shortlist_basic/json", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  res.json(JSON.parse(fs.readFileSync(merged_filename_hourly2)));
});

async function runJob2() {
  var infile = "data/routes2" + cfg.xpid + ".json";
  let routes = JSON.parse(fs.readFileSync(infile));
  let currentTime = Date.now();
  var sim_filename_hourly2 = "data/sim2_" + cfg.xpid + "_hourly.json";
  console.log("routes:" + infile);
  var resultsArray = await simulate2.runSim(routes, sim_csv_filename, "10");
  fs.writeFileSync(sim_filename_hourly2, JSON.stringify(resultsArray), "utf8");
  var shortlist_filename_hourly2 = "data/shortlist2" + "_" + cfg.xpid + ".json";
  shortlist.save_shortlist(sim_filename_hourly2, shortlist_filename_hourly2);
  merge_shortlist.merge_shortlist(
    shortlist_filename_hourly2,
    merged_filename_hourly2
  );
  //fs.unlinkSync(shortlist_filename_hourly2);
  console.log("Hourly simulation done and shortlisted.");
}

