
var zlog = require('./utils/zlog'),
    step = require('step');

var postProcess = function (header, body, callback) {
    step(
        function buildHeaders() {
            header["Content-Type"] = "application/json; charset=utf-8";
            var date = new Date().toUTCString();
            header["Date"] = date;
            header["Server"] = 'Cottage-S3 on node.js';
            header["Content-Length"] = body.length;
            return {
                header: header,
                body: body
            };
        },
        callback
    );
};

var api = module.exports = {
    register: function (callback) {
        step(
            function () {
                zlog.d("register");
            },
            
            callback
        );
    },

    index: function (callback) {
        step(
            function () {
                postProcess({}, 'welcome to use Cottage-S3', this);
            },
            callback
        );
    },

    notfound: function (path, callback) {
        callback({
            code: 404,
            msg: path + ' not found'
        });
    }
};

