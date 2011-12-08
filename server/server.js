
var http = require('http');

http.createServer(function(req, res) {
    require('./utils/zlog').i(1, 'asdf', [2,3]);
    res.writeHead(200);
    res.write('Hello');
    res.end();
}).listen(80);

