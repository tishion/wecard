'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var WxAccessToken = require('../../wx-api/accessToken.js');
/**
 * Operations on /develop/wxaccesstoken
 */
module.exports = {
    /**
     * summary: Get WX access token
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: develop_getWxAccessToken
     */
    get: {
        200: function (req, res, callback) {
            return WxAccessToken.getToken()
                .then(token => {
                    if (token) {
                        return callback(null, {
                            responses: token
                        });
                    } else {
                        return new HttpError.InternalServerError(ErrorCode.err_accessTokenUnavailable);
                    }
                }).catch(err => {
                    return callback(err);
                });
        }
    }
};
