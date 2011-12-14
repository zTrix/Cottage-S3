
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

function get_res_code(code) {
    var res_code = 200;
    if (code > errcode.INVALID_PARAM && code < errcode.NO_ERROR) {
        res_code = 500;
    } else if (code <= errcode.INVALID_PARAM) {
        res_code = 400;
    }
    return res_code;
}

for (var i in errcode) {
    module.exports[i] = {
        //code: get_res_code(errcode[i]),
        err: errcode[i],
        msg: err_desc[i],
        my_msg: function (new_msg) {
            return {
                //code: this.code,
                err: this.err,
                msg: new_msg || this.msg
            }
        }
    };
}

