const express = require('express');
const axios = require('axios');
const app = express()
const port = 3000;
const server = require('http').createServer(app);

app.get('/', (req, res) => {
  let response = null;
  new Promise(async (resolve, reject) => {
    try {
      response = await axios("https://www.cbr-xml-daily.ru/daily_json.js");
    } catch (error) {
      response = null;
      console.log(error);
      reject(error);
    };
    if (response) {
      let json = response.data;
      console.log(json);
      resolve(json);
      res.send(json);
    }
  })
});

server.listen(port, function() {
  console.log(`listening on ${port}`);
});