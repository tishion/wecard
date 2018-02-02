'use strict';
var HttpError = require('http-errors');
var Config = require('../config/config.js');
var AuthJwt = require('./jwtAuth.js');
/**
 * Authorize function for securityDefinitions:Bearer
 * type : apiKey
 * description: 
 */
module.exports = function authorize(req, res, next) {
    var authorization = req[this.in](this.name);
    //console.log('Authorization: %s', authorization);
    if (authorization) {
        var sa = authorization.split(' ');
        if (2 == sa.length && sa[0] == 'Bearer') {

            var user = AuthJwt.verifyToken(sa[1], Config.tokenSecret);
            if (user && user.id) {
                //console.log('User Id: %s', user.id);
                req.session = {
                    userId: user.id,
                    sessionKey: user.wx
                };
                return next();
            }
        }
    }

    next(new HttpError.Unauthorized());
};
