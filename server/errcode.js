
var errcode = {
    NO_ERROR: 0,
    UNKNOWN_ERROR: -1,
    INTERNAL_ERROR: -10,
    INVALID_PARAM: -100
};

var err_desc = {};

err_desc[errcode.NO_ERR] = 'success';
err_desc[errcode.UNKNOWN_ERR] = 'unknown error occured';
err_desc[errcode.INTERNAL_ERR] = 'sorry, internal error occured';
err_desc[errcode.INVALID_PARAM] = 'invalid parameters provided';

module.exports = {
    get_err_desc: function (code) {
        return err_desc[code];
    }
};

for (var i in errcode) {
    module.exports[i] = errcode[i];
}

