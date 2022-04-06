const { response } = require('express');
const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const app = express();
const port = 3000;
const request = require('request') //отправка http-запросов на сторонние сервисы
var server = require('http').createServer(app);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.static('public'));

app.get('/scoring', function (req, res) {
  res.sendFile('/Users/ekaterinakotova/Desktop/Lab 2/public/index.html');
});

app.post('/scoring', (req, res) => {
  request('http://localhost:8081/hello', (err, response, body)=>{
    //if(err) return res.status(500).send({message:err})
    console.log(body)
    })
  // console.log(req.body);

  // const url = "mongodb://localhost:3001";
  // const client = new MongoClient(url);

  // client.connect(function (err, client) {
  //   const db = client.db('clients');
  //   const collection = db.collection('info');
  //   let clientInformation = req.body;
  //   collection.insertOne(clientInformation, function (err, result) {
  //     if (err) {
  //       return console.log(err);
  //     }
  //     console.log(result);
  //     console.log(clientInformation);
  //     client.close();
  //   });
  // });

  res.send('OK');
});

server.listen(port, function () {
  console.log(`listening on ${port}`);
});