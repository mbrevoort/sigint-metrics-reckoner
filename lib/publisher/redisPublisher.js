var router  = require('./../router'),
    redis   = require('redis');

function RedisPublisher(config) {
  // TODO redis config
  this._wireUp();
}

module.exports = RedisPublisher;

RedisPublisher.prototype.stop = function stop() {
  router.removeListener('publish', this._boundHandleMetric);
  this.client.end();
}


RedisPublisher.prototype._wireUp = function _wireUp() {
  this._boundHandleMetric = this._handleMetric.bind(this);
  router.on('publish', this._boundHandleMetric);

  this.client = redis.createClient();
}

RedisPublisher.prototype._handleMetric = function _handleMetric(name, value, date, period) {
  var payload = { value: value, date: date, period: period };
  this.client.publish(name, JSON.stringify(payload));
}
