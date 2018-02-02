'use strict';
var db = require('../../models');
/**
 * Operations on /develop/generatemockdata
 */
module.exports = {
    /**
     * summary: Generate mock data
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: develop_generateMockData
     */
    get: {
        200: function (req, res, callback) {
            return callback(null, {
                responses: 'Databse was reset successfully.'
            });
        }
    }
};
