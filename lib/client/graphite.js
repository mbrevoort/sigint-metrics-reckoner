var redis       = require('redis'),
    LazySocket  = require('lazy-socket'),
    url         = require('url'),
    _           = require('underscore');

module.exports = Graphite;

//
// default options
//
var DEFAULTS = {
  carbon: {
    host: 'localhost',
    port: 2003
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    filters: ['*']
  }
};

/**
 * Constructor, takes object of options with these defaults
 *
 *     {
 *       carbon: {
 *         host: 'localhost',
 *         port: 2003
 *       },
 *       redis: {
 *         host: 'localhost',
 *         port: 6379,
 *         password: null,
 *         filters: ['*']
 *       }
 *     }
 *
 *  @param options {object} 
 */
function Graphite(options) {
  this.options = _.extend(DEFAULTS, options || {});
  this._wireUpRedis();
  this._wireUpCarbon();
}

/**
 * Initialize Redis including connecting, auth and subscriptions
 *
 * @api private
 */
Graphite.prototype._wireUpRedis = function _wireUpRedis() {
  var self = this;
  self.redisClient = redis.createClient(self.options.redis.port, self.options.redis.host);
  self.redisClient.auth(self.options.redis.password, self._authCallback);

  self.redisClient.on('pmessage', function (pattern, channel, message) {
    self._handleMessage(channel, message);
  });

  self.redisClient.on('message', function (channel, message) {
    self._handleMessage(channel, message);
  });

  // setup the redis filters
  self.options.redis.filters.forEach(function(filter, i) {
    if(filter.indexOf('*') === -1)
      self.redisClient.subscribe(filter);
    else
      self.redisClient.psubscribe(filter);
  });    
};

/**
 * Initialize Carbon connection
 *
 * @api private
 */
Graphite.prototype._wireUpCarbon = function _wireUpCarbon() {
  var carbonDsn = 'plaintext://' + this.options.carbon.host + ':' + this.options.carbon.port + '/';
  this.carbonClient = new CarbonClient({
    dsn: carbonDsn
  });
};

/**
 * Redis message handler
 *
 * @param channel {string} Redis channel
 * @param message {string} Stringified JSON object
 *
 * @api private
 */
Graphite.prototype._handleMessage = function _handleMessage (channel, message) {
    try {
      var parsed = JSON.parse(message);
      console.log("client channel " + channel + ": " + message);
      this.carbonClient.write(channel, parsed.value, parsed.date);
    }
    catch(err) {
      console.log(err);
    }
};

/**
 * Redis Auth Callback
 *
 * @param err {object} Error object if error, else falsy
 * @param res {object} Redis auth response
 *
 * @api private
 */
Graphite.prototype._authCallback = function _authCallback(err, res) {
    if(err) {
      console.error('Redis Authentication Failed! BOOOOOOOOOM', err);
      throw err;
    }  
};

// 
// CarbonClient derived from:
// https://raw.github.com/felixge/node-graphite/master/lib/CarbonClient.js
//

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