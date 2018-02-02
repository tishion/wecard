'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../error/code.json');
var db = require('../models');
/**
 * Operations on /namecard
 */
module.exports = {
    /**
     * summary: Get all Namecards by current User
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: namecard_getByCurrentUserId
     */
    get: {
        200: function (req, res, callback) {
            db.Namecard.findAll({
                where: {
                    userId: req.session.userId,
                }
            }).then(namecards => {
                if (!namecards) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                var result = namecards.map((item, index, input) => {
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
    },
    /**
     * summary: Create a Namecard
     * description: 
     * parameters: body
     * produces: 
     * responses: 200
     * operationId: namecard_create
     */
    post: {
        200: function (req, res, callback) {
            var namecard = req.body;
            delete namecard.id;
            namecard.userId = req.session.userId
            if ('WORK' === namecard.cardType) {
                namecard.school = '';
                namecard.major = '';
                namecard.grade = 0;
            } else if ('STUDY' === namecard.cardType) {
                namecard.company = '';
                namecard.department = '';
                namecard.occupation = '';
                namecard.exCompany = '';
                namecard.exDepartment = '';
                namecard.exOccupation = '';
            } else {
                return callback(new HttpError.BadRequest(ErrorCode.err_invalidCardType));
            }

            return db.Namecard.count({
                where: {
                    userId: req.session.userId
                }
            }).then(total => {
                if (total > 5) {
                    throw new HttpError.BadRequest(ErrorCode.err_namecardCountExceedsLimit);
                }
                return db.Namecard.create(namecard);
            }).then(created => {
                if (!created) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return callback(null, {
                    responses: created.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    },
    /**
     * summary: Update the Namecard
     * description: 
     * parameters: body
     * produces: 
     * responses: 200
     * operationId: namecard_update
     */
    put: {
        200: function (req, res, callback) {
            var namecard = req.body;
            return db.Namecard.findOne({
                where: {
                    id: namecard.id,
                    userId: req.session.userId,
                }
            }).then(original => {
                if (!original) {
                    throw new HttpError.NotFound();
                }
                // Update attributes
                for (var attr in namecard) {
                    if (original.rawAttributes.hasOwnProperty(attr)) {
                        original[attr] = namecard[attr];
                    }
                }
                original.userId = req.session.userId;
                return original.save();
            }).then(updated => {
                if (!updated) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return callback(null, {
                    responses: updated.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};