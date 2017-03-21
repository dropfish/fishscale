var mysql = require("mysql");
var fs = require("fs");
var express = require('express');
var request = require('request');
var path = require('path');

var app = express();
// This allows the `nodemon` command to be run from anywhere without breaking
// the loading of static resources. Resources on this:
// http://expressjs.com/en/starter/static-files.html
// http://stackoverflow.com/questions/27464168
app.use('/scripts', express.static(__dirname + '/node_modules/react/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/react-dom/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/underscore/'));
app.use('/scripts', express.static(__dirname + '/node_modules/axios/dist/'));
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

app.get('/search_flights', function(req, res) {
    console.log(req.query);

    let market = "US",
        currency = "USD",
        locale = "en-US",
        originPlace = req.query.originPlace,
        destinationPlace = req.query.destinationPlace,
        outboundPartialDate = req.query.outboundPartialDate,
        inboundPartialDate = req.query.inboundPartialDate,
        apiKey = "ju754158162474215655445986931695";

    let url = `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${originPlace}/${destinationPlace}/${outboundPartialDate}/${inboundPartialDate}?apiKey=${apiKey}`

    request(url, function (error, response, body) {
        console.log(error);
        if (!error && response.statusCode == 200) {
            console.log("got body, sending to client...");
            res.send({status: 'success!'});
        }

        // log_data(body);
    });
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
