var router  = require('./../router'),
    redis   = require('redis');

function RedisPublisher(config) {
  // TODO redis config
  this._wireUp();
}

module.exports = RedisPublisher;

RedisPublisher.prototype._wireUp = function _wireUp() {
  router.on('publish', this._handleMetric);
}

RedisPublisher.prototype._handleMetric = function _handleMetric() {
  // TODO publish to Redis
}
