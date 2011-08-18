var express = require('express'),
    app = express.createServer(),
    TwitterStreamer = require('./TwitterStreamer.js').TwitterStreamer,
    io = require('socket.io').listen(app);

var params = { track: [ "#devlink", "devlink", "#devlink2011", "devlink2011" ] };
var streamer = new TwitterStreamer(params, 400);

var Server = function(port, streamer) {
    var _sockets = [],
        _wireUpSocket = function(socket) {
            _sockets.push(socket);
            console.log("Socket ID " + socket.id + " connecting...");
            console.log("Socket count now: " + _sockets.length);
            socket.emit("init", { tweets: streamer.tweets });
            socket.on('end', function (socket) {
                _sockets.splice(_sockets.indexOf(socket,1));
            });
        },
        _updateClients = function(payload) {
           _sockets.forEach(function(socket) {
               socket.emit("newTweet", payload);
           });
        };

        io.set('log level', 1);
        app.use("/", express.static(__dirname + '/client'));
        app.listen(port);
        io.sockets.on('connection', _wireUpSocket );
        streamer.on("newTweet", _updateClients );
        streamer.start();
};

//profiler.startProfiling('startup');
var server = new Server(8001, streamer);
//profiler.stopProfiling('startup');
