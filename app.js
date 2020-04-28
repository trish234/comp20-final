const express = require("express");
const bodyParser = require('body-parser'); //for POST data
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
const router = express.Router();
const hostname = '127.0.0.1';
const port = 3000;
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');

function intervalFunc() {
  console.log("In interval func");
  const update = () =>
  fetch('https://api.petfinder.com/v2/oauth2/token');
  update();
}

/* Configure routes here ------------------------------------------- */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});
//special route-- we need to POST the data to the HTTP server of the API every 6 minutes
//                to get the authentication token
router.post('https://api.petfinder.com/v2/oauth2/token', function(req, res) {
  console.log("in post here");
  res.send("grant_type=client_credentials&client_id=" + proccess.env.API-KEY + "&client_secret=" + process.env.API-SECRET);
  console.log('Got body:', req.body);
  //console.log('Access token:', req.body.access_token);
  res.sendStatus(200);
});
/* ----------------------------------------------------------------- */

app.use('/', router);
app.use('/public/', express.static('./public')); //show images on the pages

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    //setInterval(intervalFunc, 120000); //should run every 2min
    setInterval(intervalFunc, 900); //testing purposes
});


  
