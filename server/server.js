
var http = require('http'),
    url  = require('url'),
    api  = require('./api'),
    Err  = require('./errcode'),
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
addRoute(/^\/api\/upload[?.*]?$/, api.upload);
addRoute(/^\/api\/fetch[?.*]?$/, api.fetch);
addRoute(/^\/api\/remove[?.*]?$/, api.remove);
addRoute(/^\/api\/space[?.*]?$/, api.space);
addRoute(/^\/$/, api.index);
addRoute(/^\/(.*)$/, api.notfound);

var handleRoute = function (req, res, handler, match) {
    var callback = function callback(err, data) {
        if (err) {
            var code = err.code || Err.get_res_code(err.err) || 500;
            var ret = {
                err: err.err || Err.UNKNOWN_ERROR.err,
                msg: err.msg || '' + err
            }
            Z.w(err.stack || arguments.callee);
            res.writeHead(code);
            res.write(JSON.stringify(ret, null, ''));
            res.end();
            Z.i('[ ' + code + ' ] ' + req.url);
        } else if (!data) {
            res.writeHead(500);
            res.write(JSON.stringify({
                err: -1,
                msg: 'server generated no data'
            }, null, ''));
            res.end();
        } else {
            var header = {};
            var body;
            if (data.header && data.body) {
                for (var i in data.header) {
                    header[i] = data.header[i];
                }
                body = data.body;
            } else {
                body = data || {};
            }
            if (typeof body == 'function') {
                var tmp = {};
                for (var i in body) {
                    tmp[i] = body[i];
                }
                body = tmp;
            }
            header['Date'] = new Date().toUTCString();
            header['Server'] = 'Cottage-S3 on node.js';
            if (!header['Content-Type']) {      // content type not provided, we must guest one
                if (body instanceof Buffer) {
                    header['Content-Type'] = "application/octet-string";
                } else if (typeof body == 'object') {
                    header['Content-Type'] = "application/json; charset=utf-8";
                } else {
                    header['Content-Type'] = "application/octet-string";
                }
            }
            if (body instanceof Buffer) {

            } else if (typeof body == 'object') {
                body = JSON.stringify(body, null, '');
            } else if (typeof body == 'number') {
                body = '' + body;
            }
            header['Content-Length'] = body.length;
            res.writeHead(200, header);
            res.write(body);
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

