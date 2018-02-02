'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var db = require('../../models');
/**
 * Operations on /group/{id}
 */
module.exports = {
    /**
     * summary: Get the Group by id
     * description: 
     * parameters: id
     * produces: 
     * responses: 200
     * operationId: group_getById
     */
    get: {
        200: function (req, res, callback) {
            return db.Group.findById(req.params.id)
                .then(group => {
                    if (!group) {
                        throw new HttpError.NotFound();
                    }
                    return Promise.all([
                        group,
                        db.GroupMember.findOne({
                            where: {
                                groupId: group.id,
                                userId: req.session.userId
                            }
                        })
                    ]);
                }).spread((group, self) => {
                    // If the current user doesn't exist in the group then reject the request
                    if (!self) {
                        throw new HttpError.Forbidden(ErrorCode.err_alienUserForbidden);
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
    }
};
