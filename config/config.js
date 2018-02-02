'use strict';

var ConfigJson  = require('./config.json');

var env = process.env.NODE_ENV || 'development';
var config = ConfigJson[env];

var region = process.env.AZURE_REGION;
var regionConfig = config[region];

for (var attr in regionConfig) {
    config[attr] = regionConfig[attr];
}

config.port = config.port || process.env.PORT;

module.exports = config;
