var EventEmitter  = require('events').EventEmitter,
    router        = require('./router'),
    measured      = require('measured');

// A Harvester collects raw inbound signals, aggregates metrics
// and emits aggregated results periodically

function Harvester(periodMs) {
  this.period = periodMs;
  this._interval = null;
  this._firstTimeout = null;  
  this._collection = new measured.Collection('sigint');
}

module.exports = Harvester;

Harvester.prototype.__proto__ = EventEmitter.prototype;
Harvester.prototype.MINUTE = 60000;
Harvester.prototype.TENMINUTE = 600000;
Harvester.prototype.HOUR = 3600000;
Harvester.prototype.DAY = 86400000;

//
// Start the Harvester 
//
Harvester.prototype.start = function() {
  this._wireUp();
  this._initInterval();
};

//
// Start the harvest and publish interval
//
Harvester.prototype._initInterval() = function _initInterval() {
  var self = this,
      now = Date.now(),
      firstTimerOffset = self.period - (now % self.period);

  this._firstTimeout = setTimeout(function() {
    self._harvest();
    self._interval = setInterval(self._harvest.bind(self), self.period);
  }, firstTimerOffset);
}

//
// Wire up the Harvester listeners for inbound signals
Harvester.prototype._wireUp() = function _wireUp() {
  var self = this;

  router.on('signal', function(signal) {
    // TODO process signal
  });
}

Harvester.prototype._harvest = function _harvest() {
  var snapshot = this._collection.toJSON();
  router.emit('publish', snapshot, new Date(), this.period);
};
