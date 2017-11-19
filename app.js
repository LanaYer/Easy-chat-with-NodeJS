var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./lib/chat_server.js');
var mysql = require('mysql');

var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'timetrack'
});

var server = http.createServer(function(request, response) {
    var filePath = false;
    switch(request.method) {
        case 'POST':

        break;
        case 'GET':
            switch(request.url) {
                case '/':
                    filePath = 'public/index.html';
                break;
                default:
                    filePath = 'public' + request.url;
                    break;
            }
            break;

    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});
chatServer.listen(server, db);


function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

db.query(
    "CREATE TABLE IF NOT EXISTS chat ("
    + "id INT(10) NOT NULL AUTO_INCREMENT, "
    + "date DATETIME, "
    + "name LONGTEXT,"
    + "message LONGTEXT,"
    + "PRIMARY KEY(id))",
    function(err) {
        if (err) throw err;
        console.log('Server started...');
        server.listen(80, '127.0.0.1');
    }
);
