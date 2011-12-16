
var Z    = require('./utils/zlog'),
    Db   = require('./db'),
    Step = require('step'),
    Err  = require('./errcode'),
    StreamBuffer = require('./utils/streambuffer'),
    QueryString = require('querystring');

function parse_input(req, callback) {
    var input = '';
    Step(
        function () {
            req.on('data', function (data) {
                input += data;
            });
            req.on('end', this);
        },

        function () {
            return QueryString.parse(input);
        },

        callback
    );
};

function api_wrapper(api) {
    return function(callback) {
        var req = this;
        Step(
            function () {
                parse_input(req, this);
            },
            
            api,
            
            callback
        );
    };
};

var api = module.exports = {
    register: api_wrapper(function (err, param) {
        if (param.email && param.password) {
            Db.register(param.email, param.password, this);
        } else {
            return Err.INVALID_PARAM;
        }
    }),

    login: api_wrapper(function login(err, param) {
        if (err) {
            this(err);
            return;
        }
        if (param.email && param.password) {
            Db.login(param.email, param.password, this);
        } else {
            return Err.INVALID_PARAM;
        }
    }),

    space: api_wrapper(function (err, param) {
        if (err) {
            this(err);
            return;
        }
        if (!param.token) {
            return Err.INVALID_PARAM('token required to get space info');
        }
        var callback = this;
        Step(
            function () {
                Db.check_token(param.token, this);
            },

            function (err, email) {
                if (!email) {
                    callback(null, Err.INVALID_PARAM('wrong token'));
                    return;
                }
                Db.space(email, this);
            },

            function (err, space_left) {
                return {
                    err: Err.NO_ERROR.err,
                    msg: 'success',
                    space: space_left
                }
            },

            callback
        );
    }),

    remove: api_wrapper(function (err, param) {
        if (err) {
            this(err);
            return;
        }
        if (!param.token || !param.key) {
            return Err.INVALID_PARAM;
        }
        var callback = this;
        var user_account;
        Step(
            function () {
                Db.check_token(param.token, this);
            },

            function (err, email) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!email) {
                    callback(null, Err.INVALID_REQUEST('wrong token'));
                    return;
                }
                user_account = email;
                Db.strlen(email, param.key, this.parallel());
                Db.remove(email, param.key, this.parallel());
            },

            function (err, size, data) {
                if (err) {
                    callback(err);
                    return;
                }
                if (data == 0) {
                    callback(null, Err.INVALID_REQUEST('failed, no data for key "' + param.key + '"'));
                    return;
                }
                Db.incr_space(user_account, +size, this);
            },

            function (err, new_space_size) {
                return {
                    err: Err.NO_ERROR.err,
                    msg: 'success',
                    space: new_space_size
                }
            },

            callback
        );
    }),

    upload: function (callback) {
        var req = this;
        new StreamBuffer(req);
        var headers = req.headers;
        if (!headers.token || !headers.key) {
            callback(null, Err.INVALID_PARAM);
            return;
        }
        var user_account;
        var ori_space = 0, ori_size = 0, new_size = 0;
        Step(
            function () {
                Db.check_token(headers.token, this);
            },

            function (err, email) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!email) {
                    callback(null, Err.INVALID_REQUEST('wrong token'));
                    return;
                }
                user_account = email;
                Db.strlen(email, headers.key, this.parallel());
                Db.space(email, this.parallel());
            },

            function (err, size, space) {
                ori_space = space;
                ori_size = size;
                Db.set(user_account, headers.key, '', this);
            },

            function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                var next = this;
                req.streambuffer.ondata(function (data) {
                    new_size += data.length;
                    Db.append(user_account, headers.key, data, function () {});
                });
                req.streambuffer.onend(function () {
                    Z.i("upload success for " + user_account + " with key = " + headers.key + ", size = " + new_size);
                    next(null);
                });
            },

            function (err) {
                ori_space = +ori_space + ori_size - new_size;
                Db.set_space(user_account, ori_space, this);
            },

            function (err, new_len) {
                return {
                    err: Err.NO_ERROR.err,
                    msg: 'success',
                    size: new_size,
                    space: ori_space
                }
            },

            callback
        );
    },

    fetch: function fetch(callback) {
        var req = this;
        var headers = req.headers;
        if (!headers.token || !headers.key) {
            return Err.INVALID_PARAM("invalid param: no token or key");
        }
        var user_account;
        Step(
            function () {
                Db.check_token(headers.token, this);
            },
            
            function(err, email) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!email) {
                    callback(null, {
                        header: Err.INVALID_REQUEST('wrong token'),
                        body: new Buffer(0)
                    });
                    return;
                }
                user_account = email;
                Db.get(email, headers.key, this);
            },

            function(err, buffer) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!buffer) {
                    callback(null, {
                        header: Err.INVALID_REQUEST('no data to fetch for key "' + headers.key + '"'),
                        body: new Buffer(0)
                    });
                    return;
                }
                callback(null, {
                    header: Err.NO_ERROR,
                    body: buffer
                });
            }
        );
    },

    index: function (callback) {
        callback(null, Err.NO_ERROR('welcome to use Cottage-S3'));
    },

    notfound: function (path, callback) {
        callback({
            code: 404,
            msg: path + ' not found'
        });
    }
};

