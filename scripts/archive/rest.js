const axios = require("axios");

let rest_url = "http://35.225.3.28:3000/routes/json";
axios
  .get(rest_url)
  .then((shortlist) => {
    console.log(shortlist);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
