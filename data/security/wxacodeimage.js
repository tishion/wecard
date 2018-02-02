'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var WxApi = require('../../wx-api/wxApis.js');
var WxAccessToken = require('../../wx-api/accessToken.js');
/**
 * Operations on /security/wxacodeimage
 */
module.exports = {
    /**
     * summary: Get WX application QR code image
     * description: 
     * parameters: scene, page, width
     * produces: application/jpeg
     * responses: 200
     * operationId: security_getWxQRCodeImage
     */
    get: {
        200: function (req, res, callback) {
            return WxAccessToken.getToken()
                .then(token => {
                    if (!token) {
                        throw new HttpError.InternalServerError(ErrorCode.err_accessTokenUnavailable);
                    }
                    return WxApi.getWxQRCodeImage(token, {
                        scene: req.query.scene,
                        page: req.query.page,
                        width: req.width
                    });
                }).then(response => {
                    if (response.statusCode !== 200) {
                        throw new HttpError(response.statusCode, response.body);
                    }
                    if (response.headers['content-type'] !== 'image/jpeg') {
                        throw new HttpError.BadRequest(response.body);
                    }
                    res.set({
                        'Content-Type': response.headers['content-type'],
                        'Content-disposition': response.headers['content-disposition']
                    })
                    return callback(null, {
                        responses: response.body
                    });
                }).catch(err => {
                    return callback(err);
                });
        }
    }
};
