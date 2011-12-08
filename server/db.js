
var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    Step = require('step'),
    Z = require('./utils/zlog'),
    Err = require('./errcode');

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var db = new Db('CS3', new Server(host, port, {}), {native_parser: false});

db.open(function (err, db) {
    if (err) {
        Z.e(err);
    }
});

module.exports = {
    register: function (email, password, callback) {
        Step(
            function open_collection() {
                db.collection('users', this);
            },

            function find_dup(err, collection) {
                collection.findOne({'email': email}, this);
            },

            function (err, doc) {
                if (err) {
                    callback(err);
                    return;
                }
                if (doc) {
                    Z.d(doc);
                    callback(null, {
                        err: Err.INVALID_PARAM,
                        msg: 'email already in use, please use another email'
                    });
                    return;
                }
                return {err: Err.NO_ERROR, msg: 'no dup'};
            },

            callback
        );
    }
}

