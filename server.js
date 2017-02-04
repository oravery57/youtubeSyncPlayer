var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var http = require('http');
var socketio = require( 'socket.io' );
var fs = require( 'fs' ); // ファイル入出力モジュール読み込み

var server = http.createServer();
server.on('request', function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/html' });
    res.end( fs.readFileSync('./index.html', 'utf-8') );
});

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", port " + server_port  );
});

// サーバーをソケットに紐付ける
var io = socketio.listen(server);

// 接続確立後の通信処理部分を定義
io.sockets.on( 'connection', function( socket ) {

    // クライアントからサーバーへ メッセージ送信ハンドラ（自分を含む全員宛に送る）
    socket.on( 'c2s_message', function( data ) {
        // サーバーからクライアントへ メッセージを送り返し
        io.sockets.emit( 's2c_message', { value : data.value } );
    });

    // クライアントからサーバーへ メッセージ送信ハンドラ（自分以外の全員宛に送る）
    socket.on( 'c2s_broadcast', function( data ) {
        // サーバーからクライアントへ メッセージを送り返し
        socket.broadcast.emit( 's2c_message', { value : data.value } );
    });
});