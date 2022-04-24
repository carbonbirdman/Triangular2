# Triangular searcher

Instructions

run.sh

shell.sh
cd triangular
yarn install

- Scripts create json files which are then served by index.js
- Use .env to set the path to the configuration file
- Config files contains tokens, routers and other detail
- outputs in /data
- profitable arbs in merged_shortlist_XPID.json
- Use yarn to run the scripts.
- First gather token info, then pairs, then routes.

_yarn tokens_

- decimals.js -> data/tokens.json
- prices.js -> token_price.json
- factories.js

_yarn pairs_

- pairs.js -> all_pairs.json
- reserves.js -> reserves.json
- validate_pairs.js -> tradeable_pairs.json, validated_pairs.json

_yarn routes_

- generate.js -> routes.json

_yarn simulate_
simulate_solid.js" -> simulation.json

merge_shortlists -> merged.json
(mergedshortlists cats all shortlists in the directory)

yarn runall

decimals.js
prices.js -> data/token_price.json
factories.js
pairs.js -> "data/all_pairs.json"
reserves.js -> data/reserves.json
validate_pairs.js", "data/validated_pairs.json
"data/validated_pairs.json > node scripts/generate.js -> "data/generated.json
simulate_solid.js

## ROADMAP

- Replace dollar value assessment with number of tokens

- Use obj["key3"] = "value3"; to add properties to the token and
  pair data objects, reduce proliferation.
- Investigate spread operator for object merging:

let remoteJob = {
...job,
...location
};

## REFERENCES

https://github.com/solidlyexchange/solidly

The solidly code is very useful:
https://github.com/solidlyexchange/solidly.exchange/blob/b5faba84f64dd7367dc0a63b149c782bea0c3ac0/stores/stableSwapStore.js

https://dev.to/lennythedev/quick-server-with-node-and-express-in-5-minutes-17m7

https://betterprogramming.pub/build-a-simple-web-server-using-node-js-and-express-27f3d6eb4e86

server.get("/", (req, res) => {
res.sendFile(\_\_dirname + '/index.html');
});

server.get("/json", (req, res) => {
res.json({ message: "Hello world" });
});

app.get("/header", (req, res) => {
res.setHeader("Content-Type", "application/json");
res.send(dx.token_address);
});

app.get("/json", (req, res) => {
res.json(dx.token_address);
});

npm install --save node-cron

cron.schedule(cronExpression: string, task: Function, options: Object)

scheduled: A boolean to set if the created task is scheduled (default is true)
timezone: The timezone used for job scheduling
Take a look at the following example.

import _ as cron from 'node-cron'
cron.schedule('5 _ \* \* \* \*', () => {
console.log('running a task every minute at the 5th second');
});

import _ as cron from 'node-cron'
cron.schedule('3 5 _ \* \*', () => {
console.log('running a task every day at 5:03 am');
});

import _ as cron from 'node-cron'
cron.schedule('0 _ \* \* \*', () => {
console.log('running a task every hour at 00');
});
