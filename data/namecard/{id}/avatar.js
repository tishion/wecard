'use strict';
var FileType = require('file-type')
var HttpError = require('http-errors');
var ErrorCode = require('../../../error/code.json');
var CosApi = require('../../../qcloud/cosApi.js');
var db = require('../../../models');

/**
 * Operations on /namecard/{id}/avatar
 */
module.exports = {
    /**
     * summary: Create/Update the Namecard avatar
     * description: 
     * parameters: id, file
     * produces: 
     * responses: 200
     * operationId: namecard_setAvatar
     */
    post: {
        200: function (req, res, callback) {
            return db.Namecard.findOne({
                where: {
                    id: req.params.id,
                    userId: req.session.userId
                }
            }).then(namecard => {
                if (!namecard) {
                    throw new HttpError.BadRequest(ErrorCode.err_namecardNotFound);
                }
                var fileType = FileType(req.file.buffer);
                if (['jpg', 'png'].indexOf(fileType.ext) < 0) {
                    throw new HttpError.BadRequest(ErrorCode.err_invalidAvatarFormat);
                }
                return CosApi.upLoadAvatar(req.params.id, req.file.buffer);
            }).then(response => {
                return callback(null, {
                    responses: response
                });
            }).catch(db.sequelize.Error, err => {
                return callback(new HttpError.InternalServerError(err));
            }).catch(err => {
                return callback(err);
            });
        }
    }
};
