
module.exports = {
    randomString: function (len) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        len = len || 10;
        var ret = '';
        for (var i = 0; i < len; i++) {
            var n = Math.floor(Math.random() * chars.length);
            ret += chars[n];
        }
        return ret;
    }
};
