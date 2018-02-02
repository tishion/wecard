'use strict';
var Jwt = require('jwt-simple');
var Moment = require('moment');

var jwtAuth = module.exports;

jwtAuth.version = '0.0.1';

jwtAuth.issueToken = function _issueToken(payload, secret) {
    return Jwt.encode({
        iss: 'wecard-api-service',
        sub: 'wecard-api-consumer',
        aud: "wecard.com",
        iat: Moment().format(),
        nbf: Moment().subtract(1, 's').format(),
        exp: Moment().add(1, 'd').format(),
        pub: payload,
    }, secret);
};

jwtAuth.verifyToken = function _verifyToken(token, secret) {
    try {
        return Jwt.decode(token, secret).pub;
    } catch (err) { 
        Console.log(err);
    }
    return null;
};