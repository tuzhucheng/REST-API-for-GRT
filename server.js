var http = require('http')
var express = require('express');
var app = express();
var pg = require('pg');

var loader = require('./db/loader');
var queryProcessor = require('./db/queryProcessor');

var conString = 'postgres://localhost:5432/restgrt';
var pgClient;

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.post('/reloadData', function(req, res) {
    if (pgClient) {
        loader.loadData(pgClient);
        res.send(200, 'Reload data request sent');
    } else {
        console.err('Connection not made.');
    }
});

app.get('/routes', function(req, res) {
    if (pgClient) {
        queryProcessor.getRoutes(req, res, pgClient);
    } else {
        console.err('Connection not made.');
    }
});

app.get('/*', function(req, res) {
    res.send(501, 'API is not yet implemented.');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Server listening on port " + app.get('port'));
    pg.connect(conString, function(err, client) {
        if (err) throw err;
        console.log('Connected to Postgres.');
        pgClient = client;
    });
});
