'use strict';
var HttpError = require('http-errors');
var ErrorCode = require('../../error/code.json');
var db = require('../../models');
/**
 * Operations on /group/join
 */
module.exports = {
    /**
     * summary: Notify the server that the user has shared data to the group
     * description: 
     * parameters: wxGroupId, namecardId
     * produces: 
     * responses: 200
     * operationId: group_create
     */
    post: {
        200: function (req, res, callback) {
            return db.Group.findOrCreate({
                where: {
                    wxGroupId: req.query.wxGroupId,
                }
            }).spread((group, created) => {
                if (!group) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return db.GroupMember.findOrCreate({
                    where: {
                        groupId: group.id,
                        userId: req.session.userId
                    }
                });
            }).spread((groupMember, created) => {
                if (!groupMember) {
                    throw new HttpError.InternalServerError(ErrorCode.err_databaseError);
                }
                return groupMember.update({
                    cardId: req.query.namecardId
                });
            }).then(groupMember => {
                return callback(null, {
                    responses: groupMember.prune
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
