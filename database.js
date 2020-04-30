function resetDatabase(){
    console.log("In accessDatabase()");
    const MongoClient = require("mongodb").MongoClient;
    const uri = "mongodb+srv://trishacox:" + process.env.DB_PASS + "@cluster0-wuexi.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const collection = client.db("pawsdb").collection("users");
      collection.remove({});  //clear the collection
      console.log("success clearing the database");
      client.close();
    });
    return;
}
function addUser(user){
    console.log("In addUser()");
    const MongoClient = require("mongodb").MongoClient;
    const uri = "mongodb+srv://trishacox:" + process.env.DB_PASS + "@cluster0-wuexi.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const collection = client.db("pawsdb").collection("users");
      try {
        collection.insertOne( { "username" : user} );
     } catch (e) {
        print (e);
     }
      console.log("success adding a user to database");
      client.close();
    });
    return;
}
module.exports = {resetDatabase, addUser}