
var http = require('http'),
    url  = require('url'),
    api  = require('./api'),
    zlog = require('./utils/zlog');

var routes = [];

var addRoute = function (regex, handler) {
    routes.push({
        regex: regex,
        handler: handler
    });
};

addRoute(/^\/api\/register$/, api.register);
addRoute(/^\/$/, api.index);
addRoute(/^\/(.*)$/, api.notfound);

var handleRoute = function (req, res, handler, match) {
    var callback = function (err, data) {
        if (err) {
            res.writeHead(err.code);
            res.write(err.msg);
            res.end();
            zlog.i('[ ' + err.code + ' ] ' + req.url);
        } else {
            res.writeHead(200, data.header);
            if (data.body) {
                res.write(data.body);
            }
            res.end();
            zlog.i('[ 200 ] ' + req.url);
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
    res.write('not found');
    res.end();
}).listen(80);

