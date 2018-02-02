'use strict'
var Url = require('url');
var Moment = require('moment');
var HttpError = require('http-errors');
var HttpRequest = require('request-promise');
var Config = require('../config/config.js');
var WxApi = require('./wxApis.js');
var Cache = require('../x-cache');

var wxAccessToken = module.exports;

wxAccessToken.getToken = function (callback) {
    return Cache.get('WX_ACCESS_TOKEN')
        .then(token => {
            if (!token) {
                return Promise.all([
                    // Communicate with WX server to get the WX access token
                    WxApi.getWxAccessToken(Config.appId, Config.appSecret),
                    true
                ]);
            }
            return [
                token,
                false
            ]
        }).spread((token, updated) => {
            if (updated) {
                if (!token.access_token || !token.expires_in) {
                    console.log(`Failed to authenticate with WX server: ${token.errmsg} [${token.errcode}]`);
                    throw new HttpError.BadRequest(ErrorCode.err_wxAuthenticateFail);
                }
                var expiration = (token.expires_in - 200) * 1000;
                var accessToken = {
                    access_token: token.access_token,
                    expires_at: Moment().add(token.expires_in, 's').format()
                };
                return Cache.put('WX_ACCESS_TOKEN', accessToken, expiration).then(() => token);
            }
            return token;
        });
}