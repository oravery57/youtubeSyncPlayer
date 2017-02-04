var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var http = require('http');
var server = http.createServer();
server.on('request', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello world');
  res.end();
});

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", port " + server_port  );
});