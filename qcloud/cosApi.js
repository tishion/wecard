'use strict'
var Url = require('url');
var Crypto = require("crypto");
var RequestPromise = require('request-promise');
var Cache = require('../x-cache')
var Config = require('../config/config.js');

var QCloudCosUrl = `http://gz.file.myqcloud.com/files/v2/${Config.storage.appId}/${Config.storage.bucket}/card/avatar/`;

var GenerateAccessToken = function () {
    var appid = Config.storage.appId;
    var bucket = Config.storage.bucket;
    var secret_id = Config.storage.secretId;
    var secret_key = Config.storage.secretKey;
    var current = Math.floor(new Date() / 1000);
    var expired = current + 7776000;
    var rdm = current;
    var message = `a=${appid}&b=${bucket}&k=${secret_id}&e=${expired}&t=${current}&r=${rdm}&f=`;
    var digest = Crypto.createHmac("sha1", secret_key).update(message).digest();
    var payload = Buffer.from(message);
    return Buffer.concat([digest, payload]).toString('base64');
}

var CosApi = module.exports;

CosApi.upLoadAvatar = function (id, file) {
    return Cache.get('STORAGE_ACCESS_TOKEN')
        .then(token => {
            if (!token) {
                token = GenerateAccessToken()
                return Cache.put('STORAGE_ACCESS_TOKEN', token, 86400 * 1000).then(() => token);
            }
            return token;
        }).then(token => {
            //'http://gz.file.myqcloud.com'
            return RequestPromise({
                method: 'POST',
                uri: Url.resolve(QCloudCosUrl, id),
                headers: {
                    'Authorization': GenerateAccessToken(),
                },
                formData: {
                    op: {
                        options: {
                            filename: 'op',
                        },
                        value: 'upload'
                    },
                    insertOnly: {
                        options: {
                            filename: 'insertOnly',
                        },
                        value: 0
                    },
                    filecontent: {
                        options: {
                            filename: 'filecontent',
                        },
                        value: file
                    }
                },
                json: true,
            });
        });
};