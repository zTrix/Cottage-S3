
var errcode = {
    NO_ERROR: 0,
    UNKNOWN_ERROR: -1,
    INTERNAL_ERROR: -10,
    INVALID_PARAM: -100,
    INVALID_REQUEST: -101
};

var err_desc = {
    NO_ERROR: 'success',
    UNKNOWN_ERROR: 'unknown error occured',
    INTERNAL_ERROR: 'sorry, internal error occured',
    INVALID_PARAM: 'invalid parameters provided',       // parameter check not passed
    INVALID_REQUEST: 'invalid request'
};


Object.keys(errcode).forEach(function(k, i) {
    module.exports[k] = function (new_msg) {
        return {
            err: errcode[k],
            msg: new_msg || this.msg
        }
    };
    module.exports[k]['err'] = errcode[k];
    module.exports[k]['msg'] = err_desc[k];
});

module.exports['get_res_code'] = function get_res_code(code) {
    if (code == null || code == undefined) {
        return null;
    }
    var res_code = 200;
    if (code > errcode.INVALID_PARAM && code < errcode.NO_ERROR) {
        res_code = 500;
    } else if (code <= errcode.INVALID_PARAM) {
        res_code = 400;
    }
    return res_code;
}
