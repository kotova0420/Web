const express = require('express');
const cheerio = require('cheerio');
const cyrillicToTranslit = require('cyrillic-to-translit-js');
const request = require('request');
const rp = require('request-promise');
const VKBot = require('node-vk-bot-api');
const Markup = require('node-vk-bot-api/lib/markup');
const bodyParser = require('body-parser');

const port = 5000;
const app = express();
let city = "Москва"
//const server = require('http').createServer(app);

app.use(bodyParser.json());

const token = '1365cb85490e78766afe27fb9b75c1210df9216c0351e047be2d8fdd315bf98f013feb259703bb0f99df2';
const confirmation_code='eef900df';

const bot = new VKBot({
    token: token,
    confirmation: confirmation_code
});

app.post('/', bot.webhookCallback);

bot.command('/start', (ctx)=>{
    ctx.reply('Приветствую вас! Для получения погоды введите название города');
})

bot.command('Погода на сегодня', (ctx)=>{
    cityTranslit = cyrillicToTranslit().transform(city, "_");
    const url = `https://pogoda.mail.ru/prognoz/${cityTranslit}`;
    rp(url)
        .then(function(html){
            const $ = cheerio.load(html);
            let data = [];
            $('body > div.g-layout.layout.layout_banner-side.js-module > div:nth-child(2) > div.block.block_forecast.block_index.forecast-rb-bg > div > div.information.block.js-city_one > div.information__content > div.information__content__wrapper.information__content__wrapper_left > a > div.information__content__additional.information__content__additional_temperature > div.information__content__temperature').each((idx, elem)=>{
                const title = $(elem).text().trim();
                data.push(title);
            });
            $('body > div.g-layout.layout.layout_banner-side.js-module > div:nth-child(2) > div.block.block_forecast.block_index.forecast-rb-bg > div > div.information.block.js-city_one > div.information__content > div.information__content__wrapper.information__content__wrapper_left > a > div.information__content__additional.information__content__additional_first > div').each((idx, elem)=>{
                const title = $(elem).text().trim();
                data.push(title);
            });
            ctx.reply(data.join(" "), null, Markup
                .keyboard([
                    Markup.button('Погода на сегодня', 'primary'),
                    'Погода на завтра',
                    'Поменять город'
                ],{ columns: 2 })
                .oneTime());
        })
        .catch(function(err){
            console.log(url);
            ctx.reply(`Я не понимаю. Попробуйте сами: https://pogoda.mail.ru/prognoz/moskva/`, null, Markup
            .keyboard([
                Markup.button('Поменять город', 'primary')
            ])
            .oneTime());
        })
})


bot.command('Погода на завтра', (ctx)=>{
    cityTranslit = cyrillicToTranslit().transform(city, "_");
    const url = `https://pogoda.mail.ru/prognoz/${cityTranslit}/14dney/`;
    rp(url)
        .then(function(html){
            const $ = cheerio.load(html);
            let data = [];
            $('body > div.g-layout.layout.js-module > div:nth-child(2) > div.sticky-springs.js-springs__group.js-module > div:nth-child(3) > div > div > div > div > div.cols__column__item.cols__column__item_2-1.cols__column__item_2-1_ie8 > div:nth-child(3) > div.day__temperature').each((idx, elem)=>{
                const title = $(elem).text().trim();
                data.push(title);
            });
            $('body > div.g-layout.layout.js-module > div:nth-child(2) > div.sticky-springs.js-springs__group.js-module > div:nth-child(3) > div > div > div > div > div.cols__column__item.cols__column__item_2-1.cols__column__item_2-1_ie8 > div:nth-child(3) > div.day__description > span:nth-child(1)').each((idx, elem)=>{
                const title = $(elem).text().trim();
                data.push(title);
            });
            ctx.reply(data.join(" "), null, Markup
                .keyboard([
                    Markup.button('Погода на сегодня', 'primary'),
                    'Погода на завтра',
                    'Поменять город'
                ],{ columns: 2 })
                .oneTime());
        })
        .catch(function(err){
            console.log(url);
            ctx.reply(`Я не понимаю. Попробуйте сами: https://pogoda.mail.ru/prognoz/moskva/14dney/`, null, Markup
            .keyboard([
                Markup.button('Поменять город', 'primary')
            ])
            .oneTime());
        })
})

bot.command('Поменять город', (ctx)=>{
    ctx.reply('Введите название города');
})

bot.on((ctx)=>{
    city = ctx.message.text.replace('-', ' ');
    ctx.reply(`Текущий город ${city}`, null, Markup
        .keyboard([
            Markup.button('Погода на сегодня', 'primary'),
            'Погода на завтра',
            'Поменять город'
        ],{ columns: 2 })
        .oneTime());
})

app.get('/get/:city', (req, res)=>{
    let city = req.params.city;
    city = cyrillicToTranslit().transform(city, "_");
    const url = `https://pogoda.mail.ru/prognoz/${city}`;
    rp(url)
        .then(function(html){
            const $ = cheerio.load(html);
            let data = [];
            $('body > div.g-layout.layout.layout_banner-side.js-module > div:nth-child(2) > div.block.block_forecast.block_index.forecast-rb-bg > div > div.information.block.js-city_one > div.information__content > div.information__content__wrapper.information__content__wrapper_left > a > div.information__content__additional.information__content__additional_first > div').each((idx, elem)=>{
                const title = $(elem).text();
                data.push(title);
            });
            res.send(data);
            //$('')
        })
        .catch(function(err){
            //ошибка
            console.log(err);
        })
})


app.listen(port, function(){
    console.log(`Listening on port ${port}`);
})