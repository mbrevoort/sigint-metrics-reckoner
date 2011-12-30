var redis = require('redis'),
    LazySocket = require('lazy-socket'),
    url        = require('url');

// TODO, reorganize this with a simple way to create a new one and
// init with host+port for Carbon, host+port for Redis, and 
// redis sub filter ('foo.bar', 'foo.*') -- maybe an array of channel
// filters??

var redisClient = redis.createClient();
var carbonClient = new CarbonClient({
  dsn: 'plaintext://localhost:2003/'
});

redisClient.on('pmessage', function (pattern, channel, message) {
  var parsed = JSON.parse(message);
  console.log("client channel " + channel + ": " + message);
  carbonClient.write(channel, parsed.value, parsed.date);
});

redisClient.psubscribe('foo.*');


// derived from:
// https://raw.github.com/felixge/node-graphite/master/lib/CarbonClient.js

function CarbonClient(properties) {
  properties = properties || {};

  this._dsn    = properties.dsn;
  this._socket = properties.socket || null;
}

CarbonClient.prototype.write = function(name, value, timestamp, cb) {
  this._lazyConnect();
  timestamp = Math.floor(timestamp / 1000);

  var line = [name, value, timestamp].join(' ') + '\n';
  this._socket.write(line, 'utf-8', cb);
};

CarbonClient.prototype._lazyConnect = function() {
  if (this._socket) return;

  var dsn  = url.parse(this._dsn);
  var port = parseInt(dsn.port, 10) || 2003;
  var host = dsn.hostname;

  this._socket = LazySocket.createConnection(port, host);
};

CarbonClient.prototype.end = function() {
  if (this._socket) this._socket.end();
};