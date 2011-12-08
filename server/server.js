
var http = require('http'),
    url  = require('url'),
    api  = require('./api'),
    Z = require('./utils/zlog');

var routes = [];

var addRoute = function (regex, handler) {
    routes.push({
        regex: regex,
        handler: handler
    });
};

addRoute(/^\/api\/register$/, api.register);
addRoute(/^\/api\/login$/, api.login);
addRoute(/^\/$/, api.index);
addRoute(/^\/(.*)$/, api.notfound);

var handleRoute = function (req, res, handler, match) {
    var callback = function callback(err, data) {
        if (err) {
            var ret = {
                code: err.code || 500,
                msg: err.msg || '' + err,
                stack: err.stack || arguments.callee || ''
            }
            res.writeHead(ret.code);
            res.write(JSON.stringify(ret, null, '    '));
            res.end();
            Z.i('[ ' + ret.code + ' ] ' + req.url);
        } else {
            res.writeHead(200, data.header);
            if (data.body) {
                res.write(data.body);
            }
            res.end();
            Z.i('[ 200 ] ' + req.url);
        }
    };
    handler.apply(req, match.concat([callback]));
};

http.createServer(function(req, res) {
    var req_url = url.parse(req.url);
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var match = req_url.pathname.match(route.regex);
        if (match) {
            match = Array.prototype.slice.call(match, 1);
            handleRoute(req, res, route.handler, match);
            return;
        }
    }
    res.writeHead(404);
    res.write(JSON.stringify({msg: 'not found', err: 1}, null, '    '));
    res.end();
}).listen(80);

