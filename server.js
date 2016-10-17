var mysql = require("mysql");
var express = require('express');
var app = express();
var request = require('request');

app.get('/', function (req, res) {

    con.query('SELECT * FROM sample_data', function(err,rows) {
        if (err) {
            throw err;
        }

        console.log('Data received from Db:\n');
        console.log(rows);
        // res.send(rows);
    });

    con.end(function(err) {
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
    });

    let market = "US",
        currency = "USD",
        locale = "en-US",
        originPlace = "SFO",
        destinationPlace = "JFK",
        outboundPartialDate = "2016-10",
        inboundPartialDate = "2016-10",
        apiKey = "ju754158162474215655445986931695";

    let url = `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${market}/${currency}/${locale}/${originPlace}/${destinationPlace}/${outboundPartialDate}/${inboundPartialDate}?apiKey=${apiKey}`

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body); // Show the HTML for the Modulus homepage.
            console.log("got body, sending to client...");
            res.send(body);
        }
    });
})

// First you need to create a connection to the db
var con = mysql.createConnection({
    host: "192.168.1.130",
    user: "dfish",
    password: "password",
    database: "db"
});
con.connect(function(err) {
    if (err) {
        console.log(err);
        console.log('Error connecting to Db');
        return;
    }

    console.log('Connection established');
});

var server = app.listen(8081, 'localhost', function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
