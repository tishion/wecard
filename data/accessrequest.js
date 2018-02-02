'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../error/code.json');
var db = require('../models');
/**
 * Operations on /accessrequest
 */
module.exports = {
    /**
     * summary: Get all AccessRequest sent to current user
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: accessreqeust_get
     */
    get: {
        200: function (req, res, callback) {
            db.AccessRequest.findAll({
                where: {
                    [db.sequelize.Op.or]: [
                        {
                            fromUserId: req.session.userId
                        },
                        {
                            toUserId: req.session.userId
                        }
                    ]
                },
                include: [
                    {
                        model: db.Namecard,
                        as: 'ToNamecard',
                    },
                    {
                        model: db.Namecard,
                        as: 'FromNamecard',
                    }
                ]
            }).then(accessRequests => {
                if (!accessRequests) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                var result = accessRequests.reduce((r, item) => {
                    if (!item.ToNamecard || !item.FromNamecard) {
                        // Skip the invalid item
                        return r;
                    }
                    var o = item.prune;
                    delete o.ToNamecard;
                    delete o.FromNamecard;
                    o['toUserName'] = item.ToNamecard.name;
                    o['fromUserName'] = item.FromNamecard.name;
                    r.push(o);
                    return r;
                }, []);
                return callback(null, {
                    responses: result
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    },
    /**
     * summary: Create an AccessRequest
     * description: 
     * parameters: body
     * produces: 
     * responses: 200
     * operationId: accessreqeust_create
     */
    post: {
        200: function (req, res, callback) {
            var accessRequest = req.body;

            // Check the existence of the tareget namecard
            return db.Namecard.findById(accessRequest.toNamecardId).then(toNamecard => {
                if (!toNamecard) {
                    throw new HttpError.BadRequest(ErrorCode.err_namecardNotFound);
                }
                if (req.session.userId == toNamecard.userId) {
                    throw new HttpError.BadRequest(ErrorCode.err_selfRequestNotAllowed);
                }
                // Check the ownership of the from Namecard
                return Promise.all([
                    toNamecard,
                    db.Namecard.findOne({
                        where: {
                            id: accessRequest.fromNamecardId,
                            userId: req.session.userId
                        }
                    })  
                ]);
            }).spread((toNamecard, fromNamecard) => {
                if (!fromNamecard) {
                    throw new HttpError.BadRequest(ErrorCode.err_namecardNotFound);                    
                }
                return Promise.all([
                    toNamecard, 
                    fromNamecard,
                    db.AccessRequest.findOrCreate({
                        where: {
                            toNamecardId: toNamecard.id,
                            fromNamecardId: fromNamecard.id,
                        },
                        defaults: {
                            toUserId: toNamecard.userId,
                            fromUserId: fromNamecard.userId
                        }
                    })
                ]);
            }).spread((toNameccard, fromNamecard, findOrCreateResult) => {
                if (!findOrCreateResult[1]) {
                    throw new HttpError.Conflict('Already exist');
                }
                var result = findOrCreateResult[0].prune;
                result['toUserName'] = toNameccard.name;
                result['fromUserName'] = fromNamecard.name;
                return callback(null, {
                    responses: result
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
