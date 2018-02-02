'use strict';
var db = require('../../models');
/**
 * Operations on /develop/cleancardcaseitem
 */
module.exports = {
    /**
     * summary: Clean cardcaseItem table
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: develop_cleanCardcaseItem
     */
    get: {
        200: function (req, res, callback) {
            return db.Cardcase.sync({
                force: true
            }).then(() => {
                return db.CardcaseItem.sync({
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
