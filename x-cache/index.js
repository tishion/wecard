'use strict';
var persist = require('node-persist');

var cacheEngine = {}

cacheEngine.init = function _init(options) {
}

cacheEngine.syncInit = function _syncInit(options) {
    return persist.initSync();    
}

cacheEngine.put = function _put(key, value, expiration) {
    return persist.setItem(key, value, {
        ttl: expiration
    });
}

cacheEngine.get = function _get(key) {
    return persist.getItem(key);
}

cacheEngine.clear = function _clear(callback) {
    return persist.clear(callback);
}

module.exports = cacheEngine;