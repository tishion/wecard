'use strict';
var db = require('../../models');
/**
 * Operations on /develop/resetdatabase
 */
module.exports = {
    /**
     * summary: Reset database
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: develop_resetDatabase
     */
    get: {
        200: function (req, res, callback) {
            return db.sequelize.sync({
                force: true
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
