// app/index.js
const calc = require('./calc');
const httpRequest = require('request');
const _ = require('underscore');
var fs = require('fs');

let createTableSection = (arrayOfPortfolioData, filterByThisSizeOfCoin) => {
    let formattedTableOfData = '';
    formattedTableOfData += `<tr><td>${['BIG', 'MID', 'SMALL'][filterByThisSizeOfCoin]} STUFF</td></tr>\n`
    let sumOfPercentage = 0;
    _.filter(arrayOfPortfolioData, (filterItem) => filterItem.sizeOfCoin === filterByThisSizeOfCoin ).forEach((item) => {
        formattedTableOfData += `<tr><td>${item.symbol}</td><td>${roundPercentage(item.percentOfPortfolio)}</td><td>${roundPercentageNoDivide(Number(myPortfolio.total.replace(/[^0-9\.-]+/g, ""))/item.price_usd)} ${item.symbol}</td></tr>\n`;
        sumOfPercentage += item.percentOfPortfolio;
    });
    formattedTableOfData += `<tr><td></td><td>${['Big', 'Mid', 'Small'][filterByThisSizeOfCoin]} Total Percent -----</td><td>${roundPercentage(sumOfPercentage)}</td></tr>\n`
    return formattedTableOfData
};

const roundPercentage = function(num) {return parseFloat(Math.round(num * 10000) / 100).toFixed(2) + '%' }

const roundPercentageNoDivide = function(num) {return parseFloat(Math.round(num)).toFixed(2) * .01 }

console.log(`alright let's get real`);
let myPortfolio = '';
setInterval(() => httpRequest('http://cc.caseyscarborough.com/api/totals', {headers: {'x-api-key': 'ac7c8f07-8177-4875-b5d0-5b3eec2a976f' }}, (error, response, body) => {
   myPortfolio = JSON.parse(body);
   createMyTable();
} ), 5000)
const createMyTable = () => {
    const coinmarketcapGetAllHandler = (error, response, body) => {
        const responseObj = JSON.parse(body);
        let allPortfolioData = [];
        myPortfolio.items.forEach((portfolioItem) => {
            let myPortfolioItemCoinMarketData = responseObj.find((cmcCoin) => {
                return cmcCoin.symbol === portfolioItem.symbol
            });
            myPortfolioItemCoinMarketData.percentOfPortfolio = portfolioItem.worth / Number(myPortfolio.total.replace(/[^0-9\.-]+/g, ""))
            if (Number(myPortfolioItemCoinMarketData.market_cap_usd) > Number(responseObj[9].market_cap_usd))
                myPortfolioItemCoinMarketData.sizeOfCoin = 0;
            else if (Number(myPortfolioItemCoinMarketData.market_cap_usd) > Number(responseObj[99].market_cap_usd))
                myPortfolioItemCoinMarketData.sizeOfCoin = 1;
            else
                myPortfolioItemCoinMarketData.sizeOfCoin = 2;
            ;
            allPortfolioData.push(myPortfolioItemCoinMarketData);
        })

        allPortfolioData = _.sortBy(allPortfolioData, 'percentOfPortfolio');
        allPortfolioData = _.sortBy(allPortfolioData, 'sizeOfCoin');

        console.log(
            allPortfolioData
        )
        let formattedTableOfData = '';
        formattedTableOfData += createTableSection(allPortfolioData, 0);
        formattedTableOfData += createTableSection(allPortfolioData, 1);
        formattedTableOfData += createTableSection(allPortfolioData, 2);

        fs.writeFile('/tmp/coinmarketcapresponse.html', '<html><head></head><body>' +
            '<table><tr><td>Symbol</td><td>% of Portfolio</td><td>1% of coin</td><td>10% of coin</td></tr>' +
            formattedTableOfData +
            '</table>' +
            '</body></html>', function (err) {
            if (err) {
                console.log(`${err}`);
            }
        });
    }
    /**
     * [{
 *  "id":"bitcoin",
 *  "name":"Bitcoin",
 *  "symbol":"BTC",
 *  "rank":"1",
 *  "price_usd":"14779.0",
 *  "price_btc":"1.0",
 *  "24h_volume_usd":"18118800000.0",
 *  "market_cap_usd":"248211457625",
 *  "available_supply":"16794875.0",
 *  "total_supply":"16794875.0",
 *  "max_supply":"21000000.0",
 *  "percent_change_1h":"-1.21",
 *  "percent_change_24h":"2.49",
 *  "percent_change_7d":"-2.65",
 *  "last_updated":"1515633861"
 *  }
     * @type {{items: *[], total: string, invested: string, profits: string}}
     */


    /*httpRequest('https://api.coinmarketcap.com/v1/ticker/?limit=0', (error, response, body) => {
        console.log('error:', error);
        console.log(`statusCode: ${response && response.statusCode}`);

        //console.log(`body: ${body}`);

    });*/
    httpRequest('https://api.coinmarketcap.com/v1/ticker/?limit=0', coinmarketcapGetAllHandler);
}
function writeToFile() {
    console.log(JSON.parse(body)[0])
    fs.writeFile('/tmp/coinmarketcapresponse.txt', 'body: ' + JSON.stringify(JSON.parse(body)[0]) + ' /end body', function (err) {
        if (err) {
            console.log(`${err}`);
        }
    });
}
