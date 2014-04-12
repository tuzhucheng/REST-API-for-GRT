var fs = require('fs');

var tasks = [
	function(client) {
		client.query('DROP SCHEMA IF EXISTS public CASCADE', function(err, result) {
	    	if (err) throw err;
	    	console.log('Schema dropped.');
	    	next(client);
    	});
	},
	function(client) {
		client.query('CREATE SCHEMA public', function(err, result) {
			if (err) throw err;
			console.log('Schema created.');
			next(client);
		});
	},
	function(client) {
		var sqlQuery = 'CREATE TABLE routes (' +
    					'routeNumber integer PRIMARY KEY, ' +
    					'routeName varchar(100))';

		client.query(sqlQuery, function(err, result) {
			if (err) next('Error creating schema.');
			console.log('Routes table created.');
			next(client);
		});
	},
	function(client) {
		fs.readFile('./raw/routes.txt', function(err, data) {
			if (err) throw err;
			var array = data.toString().split('\r\n'); //All files use Windows line endings
			var map = makeColumnNameToIndexMap(array[0]);
			insertRow(client, array, 1, map); // Start at 1 because row 0 is the header
		});
	}
];

/*Credits to Mike Cantelon's Node.js in Action for this implementation of serial control flow*/
function next(retVal) {
	var currentTask = tasks.shift();

	if (currentTask) {
		currentTask(retVal);
	}
}

function makeColumnNameToIndexMap(header) {
	var keys = header.split(',');
	var map = {};
	for (k in keys) {
		map[keys[k]] = parseInt(k, 10);
	}
	return map;
}

function insertRow(client, array, i, map) {
	var line = array[i];
	if (line) {
		var tokens = line.split(',');
		var routeId = tokens[map.route_id];
		var routeName = tokens[map.route_long_name];
		if (!isNaN(routeId)) {
			var sqlQuery = 'INSERT INTO routes VALUES (' + routeId + ',\'' + routeName + '\')';
			console.log(sqlQuery);
			client.query(sqlQuery, function(err, data) {
				if (err) throw err;
				insertRow(client, array, i+1, map);
			});
		} else {
			// sometimes due to route changes we get weird routeIds like 14_merged_99830344, these are skipped currently
			insertRow(client, array, i+1, map);
		}
	}

}

exports.loadData = function(client) {
	next(client);
}
