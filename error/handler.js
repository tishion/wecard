'use strict'

var ErrorHandlers = module.exports;

ErrorHandlers.globalErrorHadler = function _globalErrorHadler(err, req, res, next) {
    console.error(err);
    var error = {
        status: err.status || 500,
        message: err.message,
    };
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        error['stack'] = err.stack.split('\n');
    }
    res.status(error.status).send(error);
}