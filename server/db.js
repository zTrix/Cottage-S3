
var Mongo = require('mongodb').Db,
    Redis = require('redis'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    Step = require('step'),
    Z = require('./utils/zlog'),
    Str = require('./utils/str'),
    Err = require('./errcode');

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var mongo = new Mongo('CS3', new Server(host, port, {}), {native_parser: false});
var redis = Redis.createClient();

function user_key(u) {
    return 'user:' + u;
}

function space_key(u) {
    return 'space:' + u;
}

function token_key(t) {
    return 'token:' + t;
}

function file_key(u, f) {
    return 'object' + ':' + u + ':' + f;
}

redis.on('error', function (err) {
    Z.e(err);
});

mongo.open(function (err, db) {
    if (err) {
        Z.e(err);
    }
});

module.exports = {
    register: function (email, password, callback) {
        var users_collection;
        Step(
            function open_collection() {
                mongo.collection('users', this);
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
                    callback(null, Err.INVALID_REQUEST('email already in use, please use another email'));
                    return;
                }
                users_collection.insert({
                    'email': email,
                    'password': password
                }, this.parallel());
                redis.set(space_key(email), 10240, this.parallel());
            },

            function (err, rs, redis_rs) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!rs || !redis_rs) {
                    callback(null, Err.INTERNAL_ERROR('internal error: create account failed'));
                    return;
                }
                return Err.NO_ERROR;
            },

            callback
        );
    },

    login: function login(email, password, callback) {
        var users_collection;
        var token = Str.randomString();
        var expire_time = 3600;
        Step(
            function () {
                mongo.collection('users', this);
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
                    redis.set(token_key(token), email, this);
                    redis.expire(token_key(token), expire_time);
                } else {
                    callback(Err.WRONG_EMAIL_OR_PASSWORD);
                }
            },

            function (err, rs) {
                if (err) {
                    callback(err);
                    return;
                }
                return {
                    err: Err.NO_ERROR.err,
                    msg: 'login success',
                    token: token,
                    expire: expire_time
                };
            },

            callback
        );
    },

    check_token: function check_token(token, callback) {
        redis.get(token_key(token), callback);
    },

    set: function(user, key, data, callback) {
        redis.set(file_key(user, key), data, callback);
    },

    get: function(user, key, callback) {
        redis.get(file_key(user, key), callback);
    },

    append: function (user, key, data, callback) {
        redis.append(file_key(user, key), data, callback);
    },

    remove: function(user, key, callback) {
        redis.del(file_key(user, key), callback);
    }
}

