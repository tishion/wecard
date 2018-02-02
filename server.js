'use strict';

var Https = require('https');
var Express = require('express');
var ForceSsl = require('express-force-ssl');
var Logger = require('morgan');
var Multer = require('multer')
var BodyParser = require('body-parser');
var SwaggerizeUi = require('swaggerize-ui');
var FileSystem = require('fs');
var Path = require('path');
var Swaggerize = require('./node_modules_repack/swaggerize-express');
var Cache = require('./x-cache')
var Config = require('./config/config.js');
var ErrorHandler = require('./error/handler.js');
var WxApi = require('./wx-api/wxApis.js');
var db = require('./models');

// Initialize the memory cache
Cache.syncInit();

// Create Express instance
var App = Express()
    // Add logger
    .use(Logger('dev'))
    // foce SSL
    .use(ForceSsl)
    // Add JSON parser
    .use(BodyParser.json())
    // Add encoded URL parser
    .use(BodyParser.urlencoded({
        extended: false
    }))
    // Add multipart/form parser
    .use(Multer({
        storage: Multer.memoryStorage(),
        limits: 3 * 1024 * 1024
    }).single('avatar'))
    // Add Swaggerize
    .use(Swaggerize({
        api: Path.resolve('./config/swagger.yml'),
        handlers: Path.resolve('./handlers'),
        security: Path.resolve('./security'),
        docspath: 'docs'
    }))
    // Add Swagger UI
    .use('/viewer', SwaggerizeUi({
        docs: '/api/docs'
    }))
    // Set global erro hanlder
    .use(ErrorHandler.globalErrorHadler);

var Opts = {
    key: FileSystem.readFileSync(Path.resolve(Config.ssl.key)),
    cert: FileSystem.readFileSync(Path.resolve(Config.ssl.cert)),
    ca: FileSystem.readFileSync(Path.resolve(Config.ssl.ca)),
};


// Sync the database
db.sequelize.sync({ force: false }).then(() => {
    // Start the server
    Https.createServer(Opts, App)
        .listen(Config.port, function () {
            App.swagger.api.host = Config.host;
            if (this.address().port != undefined) {
                App.swagger.api.host += (':' + this.address().port);
            }
            /* eslint-disable no-console */
            console.log('App running on %s', App.swagger.api.host);
            /* eslint-disable no-console */
        });
}).catch(err => {
    console.log("Failed to start server:\r\n  " + err);
});