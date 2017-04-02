// Allows us to import TS files.
require("ts-node").register();

var mysql = require("mysql");
var fs = require("fs");
var express = require('express');
var request = require('request');
var path = require('path');
var querystring = require('querystring');

var helpers = require('./src/server/helpers');
var secrets = require('./src/server/secrets');

var app = express();
// This allows the `nodemon` command to be run from anywhere without breaking
// the loading of static resources. Resources on this:
// http://expressjs.com/en/starter/static-files.html
// http://stackoverflow.com/questions/27464168
app.use('/scripts', express.static(__dirname + '/node_modules/react/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/react-dom/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/underscore/'));
app.use('/scripts', express.static(__dirname + '/node_modules/axios/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/pubnub/dist/web'));
app.use('/scripts', express.static(__dirname + '/dist/'));


app.set('views', './src/templates');
app.set('view engine', 'pug');


// First you need to create a connection to the db
// var con = mysql.createConnection({
//     host: "192.168.1.130",
//     user: "dfish",
//     password: "password",
//     database: "db",
//     dateStrings: "date",
// });
// con.connect(function(err) {
//     if (err) {
//         console.log(err);
//         console.log('Error connecting to Db');
//         return;
//     }
//     console.log('Connection established');
// });

app.get('/', function(req, res) {
    console.log("index hit");
    res.render('index', {title: 'FISHscale'});
});

app.get('/browse_flights', function(req, res) {
    const country = 'UK',
        currency = 'GBP',
        locale = 'en-GB',
        originPlace = 'EDI',
        destinationPlace = 'LHR',
        outboundPartialDate = '2017-05-30',
        inboundPartialDate = '2017-06-02';
    const options = {
        url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${country}/${currency}/${locale}/${originPlace}/${destinationPlace}/${outboundPartialDate}/${inboundPartialDate}?` + querystring.stringify({apiKey: secrets.SKYSCANNER_KEY}),
        headers: {
            'Accept': 'application/json',
        },
    };

    function callback(error, response, body) {
        if (error) {
            console.log('error', error);
            res.send({
                status: 'ERROR',
            });
        } else {
            console.log(body)
            res.send({
                status: 'OK',
                browseResponse: body,
            });
        }
    }

    request.get(options, callback);
});

app.get('/create_session', function(req, res) {
    const options = {
        url: 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Forwarded-For': req.connection.remoteAddress,
            'Accept': 'application/json',
        },
        form: {
            country: 'UK',
            currency: 'GBP',
            locale: 'en-GB',
            locationSchema: 'iata',
            originplace: 'EDI',
            destinationplace: 'LHR',
            outbounddate: '2017-05-30',
            inbounddate: '2017-06-02',
            adults: 1,
            children: 0,
            infants: 0,
            apikey: secrets.SKYSCANNER_KEY,
        },
    };

    function callback(error, response, body) {
        console.log("statusCode: ", response.statusCode);
        if (error) {
            console.log('error', error);
            res.send({
                status: 'ERROR',
            });
        } else if (response.statusCode == 201) {
            console.log("got body, sending to client...");
            const location = response.headers['location'];

            // This is a horrible naming scheme, but all we really care about is that this is unique.
            const pnChannel = Date.now();
            res.send({
                status: 'OK',
                pnChannel: pnChannel,
            });
            helpers.pollLiveFlightData(location, pnChannel);
        } else {
            console.log('other status: ', response.statusCode);
            console.log(body);
            res.send({
                status: 'ERROR',
            });
        }
    }

    request.post(options, callback);
});

app.get('/log_data', function (req, res) {

    con.query('SELECT * FROM sample_data', function(err,rows) {
        if (err) {
            throw err;
        }

        console.log('Data received from Db:\n');
        console.log(rows);
        // res.send(rows);
    });

    let market = "US",
        currency = "USD",
        locale = "en-US",
        originPlace = "SFO",
        destinationPlace = "JFK",
        outboundPartialDate = "2016-11",
        inboundPartialDate = "2016-11",
        apiKey = "ju754158162474215655445986931695";

    let url = `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${originPlace}/${destinationPlace}/${outboundPartialDate}/${inboundPartialDate}?apiKey=${apiKey}`

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body); // Show the HTML for the Modulus homepage.
            console.log("got body, sending to client...");
            // res.send(body);
        }

        // log_data(body);
    });


})

function format_date(unformatted_date) {
    return unformatted_date.replace('T', ' ');
}

function log_data(data) {
    data = JSON.parse(data);
    console.log(data.Quotes);

    let values = [];
    data.Quotes.forEach((quote) => {
        values.push([
            quote.MinPrice,
            quote.Direct,
            quote.OutboundLeg ? quote.OutboundLeg.CarrierIds[0] : 0,
            quote.OutboundLeg ? quote.OutboundLeg.OriginId : 0,
            quote.OutboundLeg ? quote.OutboundLeg.DestinationId : 0,
            quote.OutboundLeg ? format_date(quote.OutboundLeg.DepartureDate) : '1970-01-01 00:00:00',
            quote.InboundLeg ? quote.InboundLeg.CarrierIds[0] : 0,
            quote.InboundLeg ? quote.InboundLeg.OriginId : 0,
            quote.InboundLeg ? quote.InboundLeg.DestinationId : 0,
            quote.InboundLeg ? format_date(quote.InboundLeg.DepartureDate) : '1970-01-01 00:00:00',
            format_date(quote.QuoteDateTime)
        ]);
    });

    var sql = `INSERT INTO past_flight_logger (
        price,
        direct,
        ob_carrier_ids,
        ob_origin_id,
        ob_destination_id,
        ob_departure_date,
        ib_carrier_ids,
        ib_origin_id,
        ib_destination_id,
        ib_departure_date,
        quote_date_time
    ) VALUES ?`;
    // var values = [
    //     [100],
    //     [200]
    // ];
    con.query(sql, [values], function(err) {
        if (err) throw err;
        con.end();
    });
}

var server = app.listen(8081, 'localhost', function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});


