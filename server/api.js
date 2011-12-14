
var Z    = require('./utils/zlog'),
    Db   = require('./db'),
    Step = require('step'),
    Err  = require('./errcode'),
    QueryString = require('querystring');

var postProcess = function (header, body, callback) {
    Step(
        function () {
            header["Content-Type"] = "application/json; charset=utf-8";
            var date = new Date().toUTCString();
            header["Date"] = date;
            header["Server"] = 'Cottage-S3 on node.js';
            if (!body) {
                body = {};
            }
            body = JSON.stringify(body, null, '');
            header["Content-Length"] = body.length;
            return {
                header: header,
                body: body
            }
        },

        callback
    );
};

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
                    postProcess({}, data, this);
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

    upload: function (callback) {
        var req = this;
        var headers = req.headers;
        if (!headers.token || !headers.key) {
            callback(Err.INVALID_PARAM);
            return;
        }
        Z.d(headers.token);
        Z.d(headers.key);
        var input = '';
        req.on('data', function (data) {
            input += data;
        });
        req.on('end', function () {
            Z.d(input);
        });
        callback(Err.NO_ERROR);
    },

    index: function (callback) {
        Step(
            function () {
                postProcess({}, Err.NO_ERROR.my_msg('welcome to use Cottage-S3'), this);
            },
            callback
        );
    },

    notfound: function (path, callback) {
        callback({
            code: 404,
            msg: path + ' not found\n'
        });
    }
};

