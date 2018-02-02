'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var Config = require('../../config/config.js');
var AuthJwt = require('../../security/jwtAuth.js');
var WxApi = require('../../wx-api/wxApis.js');
var db = require('../../models');
/**
 * Operations on /security/auth
 */
module.exports = {
    /**
     * summary: Authenticate with WX login code
     * description: 
     * parameters: WX-LOGIN-CODE
     * produces: 
     * responses: 200
     * operationId: security_auth
     */
    get: {
        200: function (req, res, callback) {
            var wxLoginCode = req.get('WX-LOGIN-CODE');
            if (!wxLoginCode) {
                return callback(new HttpError.BadRequest(err_missingWxCodeInHeader));
            }

            // Communicate with WX server to get the open id and session key
            return WxApi.getWxTicket(wxLoginCode, Config.appId, Config.appSecret)
                .then(response => {
                    if (Config.mockWxAuth) {
                        return {
                            openid: wxLoginCode,
                            session_key: 'mock_wx_auth_session_key'
                        };
                    } else {
                        // Success
                        // {
                        //     "openid": "OPENID",
                        //     "session_key": "SESSIONKEY"
                        //     "unionid":  "UNIONID"
                        // }
                        // Fail
                        // {
                        //   "errcode": 40029,
                        //   "errmsg": "invalid code"
                        // }
                        if (!response.openid || !response.session_key) {
                            console.log(`Failed to authenticate with WX server: ${response.errmsg} [${response.errcode}]`);
                            throw new HttpError.BadRequest(ErrorCode.err_wxAuthenticateFail);
                        }
                        return response;
                    }
                }).then(ticket => {
                    return Promise.all([
                        // Find the user with this open id if not found then create one
                        db.User.findOrCreate({
                            where: {
                                wxOpenId: ticket.openid,
                            }
                        }).spread(user => user),
                        ticket.session_key
                    ]);
                }).spread((user, session_key) => {
                    return Promise.all([
                        // Update the wxSessionKey
                        user.update({
                            wxSessionKey: session_key
                        }),
                        // Find the Cardcase
                        db.Cardcase.findOrCreate({
                            where: {
                                userId: user.id
                            }
                        }).spread(cardcase => cardcase)
                    ]);
                }).spread((user, cardcase) => {
                    var userInfo = {
                        id: user.id,
                        wxOpenId: user.wxOpenId,
                        cardcaseId: cardcase.id,
                        sessionKey: user.wxSessionKey
                    };
                    userInfo.token = AuthJwt.issueToken(userInfo, Config.tokenSecret);
                    return callback(null, {
                        responses: userInfo
                    });
                }).catch(db.sequelize.Error, err => {
                    return callback(new HttpError.InternalServerError(err));
                }).catch(err => {
                    return callback(err);
                });
        }
    }
};
