const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const MongoClient = require('mongodb').MongoClient
const fs = require("fs")
const base58 = require('./base58.js')

const app = express()

var fileName = "./config/config.json"
var config

try {
  config = require(fileName)
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err)
  console.log("see sample-config.json for an example")
}

var db
var protocol = config.server.protocol || "http";
var host = config.server.host || "localhost";
var port = process.env.PORT || config.server.port || 3000;

// tell Express to serve file from our public folder
app.use(express.static(path.join(__dirname, 'public')))
// handles JSON bodies
app.use(bodyParser.json());
// handles URL encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    // route to serve up the homepage (index.html)
    res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.post('/shorten', (req, res) => {
    // route to create and return a shortened URL given a long URL
    var longUrl = req.body.url
    var shortUrl = base58.encode(longUrl)

    db.collection('urls').findOne({long_url: longUrl}, (err, doc) => {
        if (doc) {
            // URL has already been shortened
            console.log('URL has already been shortened: ' + doc._id)
            // base58 encode the unique _id of that document and construct the short URL
            shortUrl = getWebHost() + base58.encode(doc._id);

            // since the document exists, we return it without creating a new entry
            res.send({
                'shortUrl': shortUrl
            });
        } else {
            // The long URL was not found in the long_url field in our urls
            // collection, so we need to create a new entry
            getNextSequence("url_id").then((id) => {
              db.collection('urls').insert({
                  "_id": id,
                  "long_url": longUrl
              }, (err, result) => {
                  if (err)
                      return console.log(err)
                  console.log('saved to database: ' + longUrl)

                  // construct the short URL
                  shortUrl = getWebHost() + base58.encode(id)

                  res.send({
                      'shortUrl': shortUrl
                  })
              })
            })
        }
    })
})

app.get('/:encoded_id', (req, res) => {
    // route to redirect the visitor to their original URL given the short URL
    var base58Id = req.params.encoded_id
    var id = base58.decode(base58Id)

    // check if url already exists in database
    db.collection('urls').findOne({_id: id}, (err, doc) => {
      if(doc){
        //redirect the user to their destination
        res.redirect(doc.long_url)
      }
      else{
        //redirect to homepage
        res.redirect('/')
      }
    })
})

MongoClient.connect(getMongoDbUrl(), (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(port, () => {
        console.log('listening on port: ' + port)
    })
})

function getWebHost(){
  return protocol + "://" + host + ":" + port + "/"
}

function getMongoDbUrl(){
  return "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.host + "/" + config.db.name
}

function getNextSequence(name) {
  var promise = new Promise(function(resolve, reject) {
    db.collection('counters').findAndModify(
      { _id: name }, // query
      [], // represents a sort order if multiple matches
      { $inc: { seq: 1 } }, // update statement
      { new: true }, // options - new to return the modified document
      function(err, doc) {
        if (err)
          reject(err)
        else
          resolve(doc.value.seq)
      }
    )
  })
  return promise
}
