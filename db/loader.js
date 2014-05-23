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
            if (err) throw err;
            console.log('Routes table created.');
            next(client);
        });
    },
    function(client) {
        var sqlQuery = 'CREATE TABLE stops (' +
                        'stopNumber integer PRIMARY KEY, ' +
                        'stopName varchar(100))';

        client.query(sqlQuery, function(err, result) {
            if (err) throw err;
            console.log('Stops table created.');
            next(client);
        });
    },
    function(client) {
        var sqlQuery = 'CREATE TABLE calendar (' +
                        'serviceId varchar PRIMARY KEY, ' +
                        'startDate date, ' +
                        'endDate date,' +
                        'monday boolean, ' +
                        'tuesday boolean, ' +
                        'wednesday boolean, ' +
                        'thursday boolean, ' +
                        'friday boolean, ' +
                        'saturday boolean, ' +
                        'sunday boolean)';

        client.query(sqlQuery, function(err, result) {
            if (err) throw err;
            console.log('Calendar table created.');
            next(client);
        });
    },
    function(client) {
        var sqlQuery = 'CREATE TABLE calendar_dates (' +
                        'calendarDateId integer PRIMARY KEY, ' +
                        'serviceId varchar, ' +
                        'calendarDate date, ' +
                        'exceptionType integer, ' +
                        'FOREIGN KEY(serviceId) REFERENCES calendar(serviceId))';

        client.query(sqlQuery, function(err, result) {
            if (err) throw err;
            next(client);
        });
    },
    function(client) {
        var sqlQuery = 'CREATE TABLE trips (' +
                        'tripId varchar PRIMARY KEY, ' +
                        'directionId integer, ' +
                        'tripHeadSign varchar(100), ' +
                        'routeId integer, ' +
                        'serviceId varchar, ' +
                        'FOREIGN KEY(routeId) REFERENCES routes(routeNumber), ' +
                        'FOREIGN KEY(serviceId) REFERENCES calendar(serviceId))';

        client.query(sqlQuery, function(err, result) {
            if (err) throw err;
            console.log('Trips table created.');
            next(client);
        });
    },
    function(client) {
        var sqlQuery = 'CREATE TABLE stop_times (' +
                        'stopTimeId serial PRIMARY KEY, ' +
                        'tripId varchar, ' +
                        'stopId integer, ' +
                        'arrivalTime time without time zone, ' +
                        'departureTime time without time zone, ' +
                        'FOREIGN KEY(tripId) REFERENCES trips(tripId), ' +
                        'FOREIGN KEY(stopId) REFERENCES stops(stopNumber))';

        client.query(sqlQuery, function(err, result) {
            if (err) throw err;
            console.log('Stop times table created.');
            next(client);
        });
    },
    function(client) {
        fs.readFile('./raw/routes.txt', function(err, data) {
            if (err) throw err;
            var array = data.toString().split('\r\n'); //All files use Windows line endings
            var map = makeColumnNameToIndexMap(array[0]);
            insertRoutesRow(client, array, 1, map); // Start at 1 because row 0 is the header
            next(client);
        });
    },
    function(client) {
        fs.readFile('./raw/stops.txt', function(err, data) {
            if (err) throw err;
            var array = data.toString().split('\r\n');
            var map = makeColumnNameToIndexMap(array[0]);
            insertStopsRow(client, array, 1, map);
            next(client);
        });
    },
    function(client) {
        fs.readFile('./raw/calendar.txt', function(err, data) {
            if (err) throw err;
            var array = data.toString().split('\r\n');
            var map = makeColumnNameToIndexMap(array[0]);
            insertCalendarRow(client, array, 1, map);
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

function insertRoutesRow(client, array, i, map) {
    var line = array[i];
    if (line) {
        var tokens = line.split(',');
        var routeId = tokens[map.route_id];
        var routeName = tokens[map.route_long_name];
        if (!isNaN(routeId)) {
            var sqlQuery = 'INSERT INTO routes VALUES (' + routeId + ',\'' + routeName + '\')';
            client.query(sqlQuery, function(err, data) {
                if (err) throw err;
                insertRoutesRow(client, array, i+1, map);
            });
        } else {
            // sometimes due to route changes we get weird routeIds like 14_merged_99830344, these are skipped currently
            insertRoutesRow(client, array, i+1, map);
        }
    }

}

function insertStopsRow(client, array, i, map) {
    var line = array[i];
    if (line) {
        var tokens = line.split(',');
        var stopId = tokens[map.stop_id];
        var stopName = tokens[map.stop_name];
        if (!isNaN(stopId)) {
            var sqlQuery = 'INSERT INTO stops VALUES (' + stopId + ',\'' + stopName + '\')';
            client.query(sqlQuery, function(err, data) {
                if (err) throw err;
                insertStopsRow(client, array, i+1, map);
            });
        } else {
            insertStopsRow(client, array, i+1, map);
        }
    }
}

function insertCalendarRow(client, array, i, map) {
    var line = array[i];
    if (line) {
        var tokens = line.split(',');
        var serviceId = tokens[map.service_id];
        var startDate = tokens[map.start_date];
        var endDate = tokens[map.end_date];
        var monday = tokens[map.monday];
        var tuesday = tokens[map.tuesday];
        var wednesday = tokens[map.wednesday];
        var thursday = tokens[map.thursday];
        var friday = tokens[map.friday];
        var saturday = tokens[map.saturday];
        var sunday = tokens[map.sunday];

        // Removing '-' from service id
        var re = /-/g;
        serviceId = serviceId.replace(re, '');

        var sqlQuery = 'INSERT INTO calendar VALUES (' + serviceId + ',\'' + startDate + ',\'' + endDate + ',\'' + monday + ',\'' + tuesday + ',\'' +
            wednesday + ',\'' + thursday + ',\'' + friday + ',\'' + saturday + ',\'' + sunday + '\')';
            client.query(sqlQuery, function(err, data) {
                if (err) throw err;
                            console.log("Finished inserting calendar.");
                insertCalendarRow(client, array, i+1, map);
            });
    }
}

exports.loadData = function(client) {
    next(client);
}
