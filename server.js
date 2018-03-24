var http = require('http');
var fs = require('fs');
var url = require('url');
var acts = require('./acts');
var serverconfig = require('./config.json');

// create http server and process with incoming requests
http.createServer(function(req, res) {
    var urlParsed = url.parse(req.url);
    switch (urlParsed.pathname) {
        case '/':
            sendFile("index.html", res);
            break;
        case '/main.js':
            sendFile("main.js", res);
            break;
        case '/canvas.js':
            sendFile("canvas.js", res);
            break;
        case '/stop':
            acts.stop(req, res);
            break;
        case '/getcfg':
            acts.sendclientconfig(req, res);
            break;
        case '/sendkey':
            var responsebody = '';
            req.on('readable', function() {
                var tmp = req.read();
                if (tmp) {
                    responsebody += tmp;
                }
            }).on('end', function() {
                responsebody = JSON.parse(responsebody);
                acts.sendserpenttodraw(res, responsebody);
            });
            break;
        default:
            res.statusCode = 404;
            res.end("Not found");
    }
}).listen(serverconfig.port);

// send file from server to client as response from request
function sendFile(fileName, res) {
    var fileStream = fs.createReadStream(fileName);
    fileStream
        .on('error', function() {
            res.statusCode = 500;
            res.end("Server error");
        })
        .pipe(res)
        .on('close', function() {
            fileStream.destroy();
        });
}