'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../error/code.json');
var db = require('../models');
/**
 * Operations on /group
 */
module.exports = {
    /**
     * summary: Get group by WX open group id
     * description: 
     * parameters: wxGroupId
     * produces: 
     * responses: 200
     * operationId: group_getByWXOpenGid
     */
    get: {
        200: function (req, res, callback) {
            return db.Group.findOrCreate({
                where: {
                    wxGroupId: req.query.wxGroupId,
                },
                defaults: {
                    name: ""
                }
            }).spread((group, created) => {
                if (!group) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return callback(null, {
                    responses: group.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    },
    /**
     * summary: Update group
     * description: 
     * parameters: body
     * produces: 
     * responses: 200
     * operationId: group_update
     */
    put: {
        200: function (req, res, callback) {

            return db.Group.findById(
                req.body.id
            ).then(group => {
                if (!group) {
                    throw new HttpError.NotFound();                    
                }
                return Promise.all([
                    group,
                    db.GroupMember.findOne({
                        where: {
                            groupId: req.body.id,
                            userId: req.session.userId
                        }
                    })
                ]);
            }).spread((group, groupMember) => {
                if (!groupMember) {
                    throw new HttpError.Forbidden(ErrorCode.err_alienUserForbidden);
                }
                if (req.body.name) {
                    if (null == req.body.name || '' == req.body.name) {
                        throw new HttpError.BadRequest(ErrorCode.err_emptyNameNotAllowed);                        
                    }
                }
                return group.update({
                    name: req.body.name
                });
            }).then(group => {
                return callback(null, {
                    responses: group.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
