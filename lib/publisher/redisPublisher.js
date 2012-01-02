var router  = require('./../router'),
    redis   = require('redis'),
    _       = require('underscore');


module.exports = RedisPublisher;

//
// default options
//
var DEFAULTS = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: null
  }
};

function RedisPublisher(options) {
  this.options = _.extend(DEFAULTS, options || {});
  // TODO redis config
  this._wireUp();
}

RedisPublisher.prototype.stop = function stop() {
  router.removeListener('publish', this._boundHandleMetric);
  this.redisClient.end();
}


RedisPublisher.prototype._wireUp = function _wireUp() {
  this._boundHandleMetric = this._handleMetric.bind(this);
  router.on('publish', this._boundHandleMetric);

  // Redis config
  this.redisClient = redis.createClient(this.options.port, this.options.host);
  this.redisClient.auth(this.options.password, this._authCallback);
}

RedisPublisher.prototype._handleMetric = function _handleMetric(name, value, date, period) {
  var payload = { value: value, date: date, period: period };
  //console.log(payload);
  this.redisClient.publish(name, JSON.stringify(payload));
}

/**
 * Redis Auth Callback
 *
 * @param err {object} Error object if error, else falsy
 * @param res {object} Redis auth response
 *
 * @api private
 */
RedisPublisher.prototype._authCallback = function _authCallback(err, res) {
    if(err) {
      console.error('Redis Authentication Failed! BOOOOOOOOOM', err);
      throw err;
    }
};
