
var errcode = {
    NO_ERROR: 0,
    UNKNOWN_ERROR: -1,
    INTERNAL_ERROR: -10,
    INVALID_PARAM: -100,
    WRONG_EMAIL_OR_PASSWORD: -101
};

var err_desc = {};

err_desc[errcode.NO_ERR] = 'success';
err_desc[errcode.UNKNOWN_ERR] = 'unknown error occured';
err_desc[errcode.INTERNAL_ERR] = 'sorry, internal error occured';
err_desc[errcode.INVALID_PARAM] = 'invalid parameters provided';
err_desc[errcode.WRONG_EMAIL_OR_PASSWORD] = 'wrong email or password provided';

module.exports = {
    err_desc: function (code) {
        return err_desc[code];
    },

    error: function (code) {
        return {
            err: code,
            msg: this.err_desc(code)
        }
    }
};

for (var i in errcode) {
    module.exports[i] = errcode[i];
}

