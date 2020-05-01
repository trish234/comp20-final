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

app.post('/mysignup', (req, res) => {
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
        // Search through database
        users.findOne({user: uname}, (err1, result1) => {
            if (err1) {
                console.log("Success: Signing you up.");
                var newUser = {user: uname, password: pword};
                users.insertOne(newUser, (err2, result2) => {
                    if (err2) {
                        console.log("Error: Couldn't sign you up. Try again");
                        res.send(false);
                    } else {
                        console.log("Success: Sign up complete.");
                        res.send(true);
                    }
                });
                res.send(true);         // Sign up
            } else {
                console.log("Error: Username not available.");
                // console.log("Try " + result.name + "01");
                res.send(false);        // Deny access
            }
        });
    });
});

app.listen(8080, () => {
    console.log('App running at http://127.0.0.1:8080/');
});