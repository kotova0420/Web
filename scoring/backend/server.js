const express = require('express');
const request = require('request'); //отправка http-запросов на сторонние сервисы
const rp = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const { Db } = require('mongodb');
const { post } = require('request');
const MongoClient = require("mongodb").MongoClient;
const app = express();
const port = 3000;
var server = require('http').createServer(app);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.static('public'));

app.get('/scoring', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'))
});

app.post('/scoring', (req, res) => {
    var options = {
        method: 'post',
        uri: 'http://localhost:8081/python',
        body: req.body,
        json: true
    }
    rp(options)
        .then(function (parsedBody) {
            //console.log(parsedBody)
            res.json(parsedBody)
        })
        .catch(function (err) {
            console.log(err);
        })
    
    const url = "mongodb://localhost:3001/"
    const client = new MongoClient(url)

    client.connect(function(err, client) {
        const db = client.db('clients');
        const collection = db.collection('info');
        let clientInformation = req.body;
        collection.insertOne(clientInformation, function(err, result) {
            if (err) {
                return console.log(err);
            }
            //console.log(result);
            console.log(clientInformation);
            client.close();
        })
    })
    low_risk = ["developer", "teacher"]
    high_risk = ["driver", "policeman", "pilot"]
    other_risk = ["manager", "judge"]
    data = req.body
    score = 0
    if (data.gender == 'female') {
        score += 0.4
    }
    age = new Date(Date.now() - new Date(data.birthDate).getTime()).getFullYear() - new Date(0).getFullYear()
    score += Math.min(Math.max(age - 20, 0) * 0.1, 0.3)
    score += Math.min(data.periodLife * 0.042, 0.42)
    if (low_risk.indexOf(data.profession) > -1) {
        score += 0.55
    } else if (high_risk.indexOf(data.profession) == -1) {
        score += 0.16
    }
    if (data.bankAccount == 'on') {
        score += 0.45
    }
    if (data.realEstate == 'on') {
        score += 0.35
    }
    if (data.insurancePolicy == 'on') {
        score += 0.19
    }
    if (data.sphere == 'public') {
        score += 0.21
    }
    score += data.periodWork * 0.059
    line = "не кредитоспособный"
    if (score > 1.25) {
        line = "кредитоспособный"
    }
    console.log(`Заёмщик ${line}`)
    /*res.send(`Заёмщик ${line}`); */
});


app.get('/search', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/search.html'))
});

app.post('/search', (req, res) => {
    const url = "mongodb://localhost:3001/"
    const client = new MongoClient(url)
    client.connect(function(err, client) {
        const db = client.db('clients');
        const collection = db.collection('info');
        let clientEmail = req.body.email;
        cursor = collection.findOne({ email: clientEmail }, (err, item) => {
            if (err) {
                res.send('Возникла ошибка');
                return console.log(err);
            }
            if (!item) {
                res.send('Пользователя с указанным email не существует');
                return
            }
            fs.readFile(path.join(__dirname, '../public/index.html'), 'utf8', function(err, data) {
                if (err) {
                    res.send('Возникла ошибка на сервере');
                    return console.log(err);
                }
                var $ = cheerio.load(data);
                $("body form h1").text('Данные пользователя');
                $("body form p i").text('Данные с сервера');
                $("body form #fieldset1 input[name='name']").attr('value', (i, value) => {
                    return value = item.name
                });
                $("body form #fieldset1 input[name='telephone']").attr('value', (i, value) => {
                    return value = item.telephone
                });
                $("body form #fieldset1 input[name='email']").attr('value', (i, value) => {
                    return value = item.email
                });

                $("body form #fieldset2 select[name='gender'] option").each((i, op) => {
                    if (op.attribs['value'] == item.gender) {
                        op.attribs['selected'] = true
                    }
                })
                $("body form #fieldset2 input[name='birthDate']").attr('value', (i, value) => {
                    return value = item.birthDate
                });
                $("body form #fieldset2 input[name='periodLife']").attr('value', (i, value) => {
                    return value = item.periodLife
                });
                $("body form #fieldset2 select[name='profession'] option").each((i, op) => {
                    if (op.attribs['value'] == item.profession) {
                        op.attribs['selected'] = true
                    }
                })
                $("body form #fieldset2 select[name='sphere'] option").each((i, op) => {
                    if (op.attribs['value'] == item.sphere) {
                        op.attribs['selected'] = true
                    }
                })
                $("body form #fieldset2 input[name='periodWork']").attr('value', (i, value) => {
                    return value = item.periodWork
                });
                if (item.bankAccount == "on") {
                    $("body form #fieldset2 input[name='bankAccount']")[0].attribs['checked'] = true
                }
                if (item.realEstate == "on") {
                    $("body form #fieldset2 input[name='realEstate']")[0].attribs['checked'] = true
                }
                if (item.insurancePolicy == "on") {
                    $("body form #fieldset2 input[name='insurancePolicy']")[0].attribs['checked'] = true
                }
                $("body form input[type='submit']").remove();
                $("body form").children().each((i, child) => {
                    child.attribs['disabled'] = true
                })
                res.send($.html())
            });
        });
    }) 
});

server.listen(port, function () {
    console.log(`listening on ${port}`);
})