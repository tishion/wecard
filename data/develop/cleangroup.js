'use strict';
var db = require('../../models');
/**
 * Operations on /develop/cleangroup
 */
module.exports = {
    /**
     * summary: Clean Group &amp; GroupMember tables
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: develop_cleanGroup
     */
    get: {
        200: function (req, res, callback) {
            return db.Group.sync({
                force: true
            }).then(() => {
                return db.GroupMember.sync({
                    force: true
                });
            }).then(() => {
                return callback(null, {
                    responses: 'Databse was reset successfully.'
                });
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
