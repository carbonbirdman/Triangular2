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





When hosting NodeJS web applications with external APIs, it’s essential to keep communication secure. By setting up a popular NodeJS web framework called Express and configuring API endpoints to communicate via HTTPS NodeJS is a great way to do that.

In this tutorial, you will learn how to install and configure the Express NodeJS application framework and set up an encrypted API endpoint to keep communication encrypted.

Let’s get started!

Prerequisites
This tutorial is a hands-on demonstration. To follow along, be sure you have the following in place:

A Linux machine – This tutorial will use Ubuntu 20.04.
NodeJS – NodeJS acts as the runtime environment for all of your Express projects.
Creating a NodeJS Project
Once you have NodeJS installed on your server, it’s time to set up Express. The easiest way to install Express is via a NodeJS package. But before you do that, first create a directory for this demo project. This directory will be located in ~/NodejsHTTPSServer for this tutorial.

mkdir ~/NodejsHTTPSServer

Next, initialize a new NodeJS project using npm init. This command will create a package.json file in the directory you just created, recording necessary metadata about a project you are building.

Use the -y flag, as shown below to accept the default values. You do not need any unique NodeJS project settings for this tutorial. This action will create a NodeJS project with the same name as the folder (NodejsHTTPSServer).

npm init -y
Installing Express
Now it’s time to install the Express package. To do so, run the command below to install the NodeJS Express package. This command will install the NodeJS Express package save the information in the package.json file, as shown below.


npm install express
nstalling Express.js
nstalling Express.js

Creating a Web Service
It’s now time to create a web service/server with Express!

1. To get started, ensure you’re still in the ~/NodejsHTTPSServer directory and create a blank file called index.js. This file will be a Javascript script that will hold all necessary code that NodeJS will execute when launching the web service.

touch index.js
2. Next, open the index.js file and add the following code to it. This file leverages both built-in NodeJS modules and the installed express module to bring up a web service listening on port 4000 when executed.


// Import builtin NodeJS modules to instantiate the service
const https = require("https");
const fs = request("fs");

// Import the express module
const express = require("express");

// Instantiate an Express application
const app = express();

// Create a NodeJS HTTPS listener on port 4000 that points to the Express app
// Use a callback function to tell when the server is created.
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

3. Once you’ve created the Express project, tell NodeJS to run it to bring up the web service.

node index.js
If successful, you will see the callback function defined above invoked to return a message letting you know it has started.

Running express Server
Running express Server

4. Finally, test the service by bringing up a web browser and navigating to http://localhost:4000/ in your browser. If successful, you should see a message “Hello from express server.”.

Creating an SSL Certificate
At this point, your NodeJS app doesn’t yet support HTTPS. It’s working with unencrypted HTTP, but that’s not secure. Let’s change that.

Related:
Your Guide to X509 Certificates (For Mortals)

To configure an SSL certificate for our NodeJS HTTPS implementation, you can either use a public, trusted certificate or a self-signed certificate. This tutorial will use a self-signed certificate signed locally by the host as it’s much easier for proof of concept projects.


If you’re running a NodeJS HTTPS application with Express in a production environment, always be sure to acquire and install a trusted certificate!

Related:
New-SelfSignedCertificate: Creating Certificates with PowerShell

1. First, generate a key file used for self-signed certificate generation with the command below. The command will create a private key as a file called key.pem.

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
