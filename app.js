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
const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://trishacox:" + process.env.DB_PASS + "@cluster0-wuexi.mongodb.net/test?retryWrites=true&w=majority";
let connectedToDB = false;
const client =  new MongoClient(uri, { useNewUrlParser: true })
client.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    connectedToDB = true;
  }
});


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
router.get('/Favorites', function (req, res) {
  res.sendFile(path.join(__dirname+'/favorites.html'));
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

//Database routes
router.post('/addUser/:user', function (req, res) {
  let user = req.params.user;
  if (connectedToDB) {
    const collection = client.db("pawsdb").collection("users");
    collection.insertOne( { "username" : user} ).catch((err) => console.error(err));
    res.send("success");
  } else {
    res.send("not connected to DB yet");
  }

});
router.get('/findUser/:user', async function (req, res){
  if (connectedToDB) {
    let user = req.params.user;
    // const result = await db.findUser(user, client);
    const collection = client.db("pawsdb").collection("users");
    const result = await collection.findOne({"username" : user}).catch((e) => console.error(e));
    const resultToSend = result == null ? "INVALID USER" : result;
    console.log("Made it out of find user with: "+ result);
    res.send(resultToSend);
  } else {
    res.send("not connected to DB yet");
  }

});
router.get('/resetDatabase', function (req, res) {
  if (connectedToDB) {
    const collection = client.db("pawsdb").collection("users");
    collection.remove({});  //clear the collection
    console.log("success clearing the database");
    res.send("success");
  } else {
    res.send("not connected to DB yet");
  }

});
/* ----------------------------------------------------------------- */

app.use('/', router);
app.use('/PetSearch', router);
app.use('/ContactUs', router);
app.use('/favorites', router);
app.use('/public/', express.static('./public')); //show images on the pages
app.use('/dogs/:gender', router);
app.use('/addUser/:user', router);
app.use('/findUser/:user', router);
app.use('/resetDatabase', router);

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


  
