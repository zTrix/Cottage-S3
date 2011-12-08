
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
        var users_collection;
        Step(
            function open_collection() {
                db.collection('users', this);
            },

            function find_dup(err, collection) {
                users_collection = collection;
                collection.findOne({'email': email}, this);
            },

            function (err, doc) {
                if (err) {
                    callback(err);
                    return;
                }
                if (doc) {
                    callback(null, {
                        err: Err.INVALID_PARAM,
                        msg: 'email already in use, please use another email'
                    });
                    return;
                }
                users_collection.insert({
                    'email': email,
                    'password': password
                }, this);
            },

            function (err, rs) {
                if (err) {
                    callback(err);
                    return;
                }
                return {err: Err.NO_ERROR, msg: 'no dup'};
            },

            callback
        );
    },

    login: function login(email, password, callback) {
        var users_collection;
        Step(
            function () {
                db.collection('users', this);
            },

            function (err, _collection) {
                users_collection = _collection;
                users_collection.findOne({
                    'email': email,
                    'password': password
                }, this);
            },

            function (err, doc) {
                if (err) {
                    callback(err);
                    return;
                }
                if (doc) {
                    return {
                        err: Err.NO_ERROR,
                        msg: 'login success'
                    };
                } else {
                    return Err.error(Err.WRONG_EMAIL_OR_PASSWORD);
                }
            },

            callback
        );
    }
}

