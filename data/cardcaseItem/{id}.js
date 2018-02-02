'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var db = require('../../models');
/**
 * Operations on /cardcaseItem/{id}
 */
module.exports = {
    /**
     * summary: Delete the CardcaseItem by id
     * description: 
     * parameters: id
     * produces: 
     * responses: 200
     * operationId: cardcaseItem_deleteById
     */
    delete: {
        200: function (req, res, callback) {
            return db.CardcaseItem.findOne({
                where: {
                    userId: req.session.userId,
                    id: req.params.id,
                }
            }).then(cardcaseItem => {
                if (!cardcaseItem) {
                    throw new HttpError.NotFound();
                }
                return cardcaseItem.destroy();
            }).then(deleted => {
                if (!deleted) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return callback(null, {
                    responses: deleted.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
