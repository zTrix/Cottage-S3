
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
            
            function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    return data;
                }
            },

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
                Db.remove(email, param.key, this);
            },

            function (err, data) {
                Z.d(err, data);
                callback(null, Err.NO_ERROR);
            }
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
                Db.set(email, headers.key, '', this);
            },

            function () {
                var next = this;
                req.streambuffer.ondata(function (data) {
                    Db.append(user_account, headers.key, data, function () {});
                });
                req.streambuffer.onend(function () {
                    Z.i("upload success for " + user_account + " with key = " + headers.key);
                    next(null, Err.NO_ERROR);
                });
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
                        header: Err.INVALID_REQUEST('no data found for key ' + headers.key),
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

