var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var pets = require('./routes/pets/pets.route');
var owners = require('./routes/owners/owners.route');
var services = require('./routes/services/services.route');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/api/v1/pets', pets);
app.use('/api/v1/owners', owners);
app.use('/api/v1/services', services);

module.exports = app;
