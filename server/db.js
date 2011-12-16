
var Redis = require('redis'),
    Step = require('step'),
    Z = require('./utils/zlog'),
    Str = require('./utils/str'),
    Err = require('./errcode');

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

module.exports = {
    register: function (email, password, callback) {
        var users_collection;
        Step(

            function find_dup() {
                redis.get(user_key(email), this);
            },

            function (err, account) {
                if (err) {
                    callback(err);
                    return;
                }
                if (account) {
                    callback(null, Err.INVALID_REQUEST('email already in use, please use another email'));
                    return;
                }
                redis.set(user_key(email), password, this.parallel());
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
                redis.get(user_key(email), this);
            },

            function (err, account) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!account) {
                    callback(null, Err.INVALID_REQUEST('no such account'));
                } else if (account == password) {
                    redis.set(token_key(token), email, this);
                    redis.expire(token_key(token), expire_time);
                } else {
                    callback(null, Err.INVALID_REQUEST('wrong email or password'));
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
    },

    space: function (user, callback) {
        redis.get(space_key(user), callback);
    }
}

