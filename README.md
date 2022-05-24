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

## SCHEDULING

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


## HTTPS and CORS

https
  .createServer(app)
  .listen(4000, ()=>{
    console.log('server is runing at port 4000')
  });

// Create an try point route for the Express app listening on port 4000.
// This code tells the service to listed to any request coming to the / route.
// Once the request is received, it will display a message "Hello from express server."
app.get('/', (req,res)=>{
    res.send("Hello from express server.")
})

node index.js

4. Finally, test the service by bringing up a web browser and navigating to http://localhost:4000/ in your browser. If successful, you should see a message “Hello from express server.”.

openssl genrsa 
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(4000, () => {
    console.log("serever is runing at port 4000");
  });
