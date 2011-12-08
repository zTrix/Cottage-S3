
var Z    = require('./utils/zlog'),
    Db   = require('./db'),
    Step = require('step'),
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
            body = JSON.stringify(body, null, '    ');
            header["Content-Length"] = body.length;
            return {
                header: header,
                body: body
            }
        },

        callback
    );
};

var api = module.exports = {
    register: function (callback) {
        var req = this;
        Step(
            function () {
                var input = '';
                var next = this;
                req.on('data', function (data) {
                    input += data;
                });
                req.on('end', function () {
                    next(null, QueryString.parse(input));
                });
            },

            function (err, param) {
                if (param.email && param.password) {
                    Db.register(param.email, param.password, this);
                } else {
                    return {
                        err: 1,
                        msg: 'wrong api parameters'
                    }
                }
            },

            function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    postProcess({}, data, this);
                }
            },
            
            callback
        );
    },

    login: function login(callback) {
        var param = req;
        Step(
            
        );
    },

    index: function (callback) {
        Step(
            function () {
                postProcess({}, {err:0, msg:'welcome to use Cottage-S3\n'}, this);
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

