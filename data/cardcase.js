'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../error/code.json');
var db = require('../models');
/**
 * Operations on /cardcase
 */
module.exports = {
    /**
     * summary: Get Cardcase by current User
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: cardcase_getByCurrentUserId
     */
    get: {
        200: function (req, res, callback) {
            return db.Cardcase.findAll({
                where: {
                    userId: req.session.userId
                }
            }).then(cardcases => {
                if (!cardcases) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                var result = cardcases.map((item, index, input) => {
                    return item.prune;
                });
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