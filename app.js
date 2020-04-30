const express = require("express");
const bodyParser = require('body-parser'); //for POST data
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
const router = express.Router();
const fetch = require('node-fetch');

//environment variables
const dotenv = require('dotenv');
dotenv.config();
const hostname = process.env.HOSTNAME;
const node_env = process.env.NODE_ENV;
const port = process.env.PORT;

//database
const db = require("./database.js")
db.accessDatabase();
db.addUser("Trisha");

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
router.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname+'/login.html'));
});
router.get('/signup', function (req, res) {
  res.sendFile(path.join(__dirname+'/signup.html'));
});
//special route-- we need to POST the data to the HTTP server of the API every 6 minutes
//                to get the authentication token
router.post('https://api.petfinder.com/v2/oauth2/token', function(req, res) {
  res.sendStatus(200);
});

//routes for finding animals

//get adoptable dogs of a particular gender
//TODO make only in boston
router.get('/dogs/:gender/:size/:age', function (req, res) {
  // Access dogs via: req.params.gender
  let gender = req.params.gender;
  if (gender == 'any'){
    gender = 'male,female';
  }
  let size = req.params.size;
  if (size == 'any'){
    size = 'small,medium,large,xlarge';
  }
  let age = req.params.age;
  if (age = 'any'){
    age = '	baby,young,adult,senior';
  }
  let url = 'https://api.petfinder.com/v2/animals?status=adoptable&type=dog&gender=' + gender + '&size=' + size + '&age=' + age;
  fetch(url, {
    method: "get",
    headers: { "Authorization": 'Bearer ' + currentToken}
  })
  .then(response => response.json())
  .then(body => {
    res.send(body);
  });

  
});
/* ----------------------------------------------------------------- */

app.use('/', router);
app.use('/PetSearch', router);
app.use('/ContactUs', router);
app.use('/login', router);
app.use('/signup', router);
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


  
