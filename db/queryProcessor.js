exports.getRoutes = function(req, res, client) {
    var sortBy = req.query.sortBy;
    var q;

    if (!sortBy) {
        q = client.query('SELECT routeNumber AS number, routeName AS name FROM routes');
    } else if (sortBy === 'number') {
        q = client.query('SELECT routeNumber AS number, routeName AS name FROM routes ORDER BY number');
    } else if (sortBy === 'name') {
        q = client.query('SELECT routeNumber AS number, routeName AS name FROM routes ORDER BY name');
    } else {
        res.send({
            code: 'INVALID_ARGUMENT',
            message: '\'sortBy=' + req.query.sortBy + '\' is not a valid query string.'
        });
        return;
    }

    q.on('row', function(row, result) {
        result.addRow(row);
    });
    q.on('end', function(result) {
        var args = req.query;
        for (i in args) {
            console.log(args[i]);
        }
        res.send(result.rows);
    });
}