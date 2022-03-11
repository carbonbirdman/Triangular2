const express = require("express");
const dx = require("./src/dexes");
var path = require("path");
const fs = require("fs");

const app = express();
var eta = require("eta");
app.set("view engine", "eta");

app.set("views", "./views");
const port = 3000;

var indexTemplate = `
<!DOCTYPE html>
<p>Links:</p>
<% it.forEach(function(user){ %>
  <a href=" <%= user %> "><%= user %> </a> </br>
<% }) %>
`;

app.get("/", (req, res) => {
  res.send(eta.render(indexTemplate, ["home", "reserves", "simulation"]));
});

var inputTemplate = `
<!DOCTYPE html>
<ul>
<% it.forEach(function(entry) {%>
<li> <%= entry.input%> -> <%= entry.output.toPrecision(3)%> 
<%= entry.token0%>  <%= entry.dexa%> 
<%= entry.token1%>  <%= entry.dexb%>
<%= entry.token2%> <%= entry.dexc%>
</li>
<%});%>
</ul>
`;

app.get("/reserves", function (req, res) {
  //array with items to send
  let items = JSON.parse(fs.readFileSync("data/trikes.json"));
  console.log(items);
  res.send(eta.render(inputTemplate, items));
});

var simTemplate = `
<!DOCTYPE html>
<ul>
<% it.forEach(function(entry) {%>
<li> <%= entry.input%> -> <%= entry.output.toPrecision(3)%> 
<%= entry.token0%>  <%= entry.dexa%> 
<%= entry.token1%>  <%= entry.dexb%>
<%= entry.token2%> <%= entry.dexc%>
</li>
<%});%>
</ul>
`;

app.get("/simulation", function (req, res) {
  //array with items to send
  let items = JSON.parse(fs.readFileSync("data/simulation.json"));
  console.log(items);
  res.send(eta.render(simTemplate, items));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  //var conn = dexes.get_connection();
  console.log(dx.token_address);
});
