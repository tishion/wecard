'use strict';
var Uuid = require('uuid');
var HttpError = require('http-errors');
var ErrorCode = require('../error/code.json');
var db = require('../models');
var emoji = require('../tests/emoji.json');
/**
 * Operations on /cardcaseItem
 */
module.exports = {
    /**
     * summary: Get all CardcaseItems by Cardcase id
     * description: 
     * parameters: cardcaseId
     * produces: 
     * responses: 200
     * operationId: cardcaseItem_getByCardcaseId
     */
    get: {
        200: function (req, res, callback) {
            db.CardcaseItem.findAll({
                where: {
                    cardcaseId: req.query.cardcaseId,
                    userId: req.session.userId
                },
                include: [
                    {
                        model: db.Namecard,
                        as: 'Namecard',
                    },
                    {
                        model: db.Group,
                        as: 'Group',
                    }
                ]
            }).then(cardcaseItems => {
                if (!cardcaseItems) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                var result = cardcaseItems.reduce((r, item) => {
                    var o = item.prune;
                    delete o.Namecard;
                    delete o.Group;
                    o['name'] = undefined
                    o['thumbnail'] = undefined
                    if ('CARD' === o.itemType) {
                        if (item.Namecard) {
                            o['name'] = item.Namecard.name;
                            o['thumbnail'] = item.Namecard.avatarUri;
                        }
                    }
                    else if ('GROUP' === o.itemType) {
                        if (item.Group) {
                            o['name'] = item.Group.name;
                            o['thumbnail'] = '';
                        }
                    }
                    else {
                        // Skip the invalid item
                        return r;
                    }
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
     * summary: Create a CardcaseItem in Cardcase
     * description: 
     * parameters: body
     * produces: 
     * responses: 200
     * operationId: cardcaseItem_Create
     */
    post: {
        200: function (req, res, callback) {
            var cardcaseItem = req.body;
            delete cardcaseItem.id;
            cardcaseItem.userId = req.session.userId

            if ('CARD' == cardcaseItem.itemType) {
                var itemStorage = db.Namecard;
            } else if ('GROUP' == cardcaseItem.itemType) {
                var itemStorage = db.Group;
            }
            else {
                return callback(new HttpError.BadRequest(ErrorCode.err_invalidItemType));
            }

            return itemStorage.findById(cardcaseItem.itemId)
                .then(itemEntity => {
                    if (!itemEntity) {
                        throw new HttpError.BadRequest(ErrorCode.err_itemObjectNotFound);
                    }
                    return db.Cardcase.findOne({
                        where: {
                            id: cardcaseItem.cardcaseId,
                            userId: req.session.userId,
                        }
                    });
                }).then(cardcase => {
                    if (!cardcase) {
                        throw new HttpError.BadRequest(ErrorCode.err_cardcaseNotFound);
                    }
                    return db.CardcaseItem.findOrCreate({
                        where: {
                            userId: cardcaseItem.userId,
                            cardcaseId: cardcaseItem.cardcaseId,
                            itemType: cardcaseItem.itemType,
                            itemId: cardcaseItem.itemId
                        }
                    });
                }).spread((item, created) => {
                    if (!item) {
                        throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                    }
                    return callback(null, {
                        responses: item.prune
                    });
                }).catch(db.sequelize.Error, err => {
                    return callback(new HttpError.InternalServerError(err));
                }).catch(err => {
                    return callback(err);
                });
        }
    }
};
