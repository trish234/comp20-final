const express = require("express");
const bodyParser = require('body-parser'); //for POST data
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
const router = express.Router();
const fetch = require('node-fetch');

//enviornment variables
const dotenv = require('dotenv');
dotenv.config();
const hostname = process.env.HOSTNAME;
const node_env = process.env.NODE_ENV;
const port = process.env.PORT;

let currentToken;

function intervalFunc() {
  console.log("Refreshing access token");
  fetch('https://api.petfinder.com/v2/oauth2/token', {
    method: "post",
    body: "grant_type=client_credentials&client_id=" + process.env.API_KEY + "&client_secret=" + process.env.API_SECRET,
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  })
  .then(res => res.json())
  .then(body => {
    currentToken = body.access_token;
  });
}

/* 
Note : access format from API website
curl -H "Authorization: Bearer {YOUR_ACCESS_TOKEN}" GET https://api.petfinder.com/v2/{CATEGORY}/
{ACTION}?{parameter_1}={value_1}&{parameter_2}={value_2}
*/

/* Configure routes here ------------------------------------------- */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});
router.get('/PetSearch', function (req, res) {
  res.sendFile(path.join(__dirname+'/PetSearch.html'));
});
router.get('/ContactUs', function (req, res) {
  res.sendFile(path.join(__dirname+'/ContactUs.html'));
});
//special route-- we need to POST the data to the HTTP server of the API every 6 minutes
//                to get the authentication token
router.post('https://api.petfinder.com/v2/oauth2/token', function(req, res) {
  res.sendStatus(200);
});

//routes for finding animals
//get adoptable dogs in boston
router.get('/dogs/:gender', function (req, res) {
  // Access dogs via: req.params.gender
  var gender = req.params.gender;
  var url = 'https://api.petfinder.com/v2/animals?type=dog&gender=' + gender;
  fetch(url, {
    method: "get",
    headers: { "Authorization": 'Bearer ' + currentToken}
  })
  .then(response => response.json())
  .then(body => {
    console.log("got some doggos");
    res.send(body);
  });

  
});
/* ----------------------------------------------------------------- */

app.use('/', router);
app.use('/PetSearch', router);
app.use('/ContactUs', router);
app.use('/public/', express.static('./public')); //show images on the pages
app.use('/dogs/:gender', router);

if (node_env === 'development'){
  intervalFunc();
  app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      setInterval(intervalFunc, 360000); //should run every 6min
  });
}
//if in deployment
else {
  intervalFunc();
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    setInterval(intervalFunc, 360000); //should run every 6min

  });
}


  
