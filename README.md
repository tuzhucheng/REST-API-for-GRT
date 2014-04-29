REST API for GRT [![Build Status](https://travis-ci.org/tuzhucheng/REST-API-for-GRT.svg?branch=master)](https://travis-ci.org/tuzhucheng/REST-API-for-GRT)
================

This is an open source REST API for Grand River Transit (GRT), which serves the Kitchener, Waterloo, and Cambridge regions. You can use this API to obtain the next bus times, future bus times, buses that stop at a particular stop, and much more. It is currently a work in progress so not all of the functionalities are implemented and the API may change rapidly.

Data is generously provided by GRT via the Region of Waterloo's Open Data Portal, using the Google Transit Feed Specifications (GTFS) format.

## Environment Setup

The backend database of this API is powered by PostgreSQL, so please make sure you have PostgreSQL installed and started before proceeding. Also make sure you have a database for this API created, named 'restgrt'. By default, PostgreSQL uses port 5432, so if you use a different port you'll need to change the port number in the `conString` in server.js. 

You'll also need to make sure you have Node.js installed. Once this is done, you need to use `npm install` to install the dependencies.

Finally, you can start the server using `node server.js`. If the connection is successful you'll see the message "Connected to Postgres" appear in the console.

## Populating Data

The first step in a fresh environment is to populate the data. This can be sending a POST request to `/reloadData`:

```
POST /reloadData
```

This only needs to be done once. But if you change the GTFS data, it needs to be done again.

## Endpoints

### /routes

```
GET /routes
```

This returns a list of routes operated by GRT with the route number and route name. `sortBy` is an optional parameter that accepts values `name` and `number`. If it is not specified the returned list will not be sorted.


More documentation will be available in the future.
