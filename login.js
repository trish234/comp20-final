// MongoDB dependencies
const client = require('mongodb').MongoClient;
const url = "mongodb+srv://Pawsibilities:COZYcomp20@cluster0-0tonn.mongodb.net/test?retryWrites=true&w=majority";
// Form-data dependencies
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// Flexible port variable
// var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/mylogin', (req, res) => {
    // Connect to MongoDB
    client.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) {
            console.log("Error: Connecting to MongoDB.");
            res.statusCode = 404;
        }
        var dbase = db.db("Pawsibilities");
        var users = dbase.collection("users");
        // Get form data
        var uname = req.body.uname;
        var pword = req.body.psw;
        // Search through database for matching username and password
        users.findOne({user: uname, password: pword}, (err, result) => {
            if (err) {
                console.log("Error: Incorrect login details.");
                res.send(false);    // Deny access
            } else {
                console.log("Success. Logging you in");
                res.send(true);     // Grant access
            }
        });
    });
});

app.listen(8080, () => {
    console.log('App running at http://127.0.0.1:8080/');
});