var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var http = require('http');
var socketio = require( 'socket.io' );
var fs = require( 'fs' ); // ファイル入出力モジュール読み込み

var server = http.createServer();
server.on('request', function(req, res) {
    var url = req.url;
    if ('/' == url) {
        res.writeHead(200, { 'Content-Type' : 'text/html' });
        res.end( fs.readFileSync('./index.html', 'utf-8') );
    } else if ('/js/youtube.js' == url) {
        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end( fs.readFileSync('./js/youtube.js', 'utf-8') );
    } else if ('/css/login.css' == url) {
        res.writeHead(200, { 'Content-Type' : 'text/css' });
        res.end( fs.readFileSync('./css/login.css', 'utf-8') );
    }
});

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", port " + server_port  );
});

// サーバーをソケットに紐付ける
var io = socketio.listen(server);

var store = [];
var state = 0;
var baseTime = null;

// 接続確立後の通信処理部分を定義
var socket = io.sockets.on( 'connection', function( client ) {

    client.emit('connected');

    client.on('disconnect', function() {
        if (store[client.id]) {
            var name = store[client.id].name;
            var room = store[client.id].room;
            delete store [client.id];
            io.to(room).emit('message', {system: true, name : 'System', message: '[' + name + '] has leaved!', time: getTime()});
            io.to(room).emit('updateMember', getMembers(room));
        }
    });

    client.on('join', function(data) {
        usrobj = {
            'room': data.room,
            'name': data.name,
            'state': "0"
        };
        store[client.id] = usrobj;
        client.join(data.room);
        client.emit("join");
        io.to(data.room).emit('message', {system: true, name : 'System', message: '[' + data.name + '] has joined!', time: getTime()});
        io.to(data.room).emit('updateMember', getMembers(data.room));
        // client.emit('System', '[' + data.name + '] has joined!');

        // client.emit('initialized');
    });

    client.on( 'play', function( data ) {
        io.to(store[client.id].room).emit('message', {system: true, name : 'System', message: '[' + data.name + '] has started new video [' + data.id + ']!', time: getTime()});
        io.to(store[client.id].room).emit( 'play', { id : data.id } );
        setState(getMembers(store[client.id].room), "0");
    });

    client.on( 'playing', function( data ) {
        var member = store[client.id];
        io.to(member.room).emit('message', {system: true, name : 'System', message: '[' + member.name + '] has resumed video.', time: getTime()});
        client.broadcast.to(member.room).emit( 'playing', { time : data.time } );
        baseTime = null;
    });

    client.on( 'sync', function( data ) {
        var member = store[client.id];

        if (baseTime) {
            var curTime = new Date().getTime();
            var sTimeOffset = curTime - parseInt(baseTime.stime);
            var timeOffset = (data.time - baseTime.time) * 1000; // ミリ秒に変換
            var offset = timeOffset - sTimeOffset;
            console.log("offset > " + offset);
            if (offset < 0) {
                baseTime = {
                    'stime': curTime,
                    'time': data.time
                };
            } else if (offset > 3000) {
                io.to(client.id).emit("sync", {offset: -offset / 1000});
            }
        } else {
            baseTime = {
                'stime': new Date().getTime(),
                'time': data.time
            };
        }
    });

    client.on( 'paused', function( data ) {
        var member = store[client.id];
        io.to(member.room).emit('message', {system: true, name : 'System', message: '[' + member.name + '] has paused video.', time: getTime()});
        client.broadcast.to(member.room).emit( 'paused', { time : data.time } );
        baseTime = null;
    });

    client.on( 'message', function( data ) {
        io.to(store[client.id].room).emit('message', {name : data.name, message: data.message, time: getTime()});
    });


});

function getTime() {
    return new Date().toISOString();
}

function getMembers(room)  {
    // TODO
    var members = [];
    Object.keys(store).forEach(function(key) {
        if (store[key].room === room) members.push(store[key]);
    });
    return members;
}

function setState (members, state) {
    members.forEach(function(member) {
        member.state = state;
    });
}