var http = require('http')
var express = require('express');
var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/*', function(req, res) {
	res.json(501, { error: 'API is not yet implemented.'});
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Server listening on port " + app.get('port'));
});
