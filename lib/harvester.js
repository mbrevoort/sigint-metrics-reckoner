var EventEmitter  = require('events').EventEmitter,
    router        = require('./router'),
    measured      = require('measured');

// A Harvester collects raw inbound signals, aggregates metrics
// and emits aggregated results periodically

function Harvester(periodMs, collectionName) {
  collectionName = collectionName || 'sigint';
  this.period = periodMs;
  this._interval = null;
  this._firstTimeout = null;
  this._collection = new measured.Collection(collectionName);
  this._running = false;
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
Harvester.prototype.start = function start() {
  this._wireUp();
  this._initInterval();
  this._running = true;
  return this;
};

Harvester.prototype.stop = function stop() {
  var self = this;
  if(self._interval) clearInterval(self._interval);
  if(self._firstTimeout) clearTimeout(self._firstTimeout);
  self._running = false;

  var metrics = this._collection._metrics;
  for (var name in metrics) {
    var metric = metrics[name];
    
    // meters have an interval that need to be cancelled
    if(metric.end) metric.end();
  }
  return this;
};

//
// Start the harvest and publish interval
//
Harvester.prototype._initInterval = function _initInterval() {
  var self = this,
      now = Date.now(),
      firstTimerOffset = self.period - (now % self.period);

  this._firstTimeout = setTimeout(function() {
    self._interval = setInterval(self._harvest.bind(self), self.period);
    self._harvest();
  }, firstTimerOffset);
}

//
// Wire up the Harvester listeners for inbound signals
//
Harvester.prototype._wireUp = function _wireUp() {
  var self = this;

  router.on('signal', function(signal) {
    if (signal.type && signal.operation && signal.value) {
      self._collection[signal.type](signal.name)[signal.operation](signal.value);
    } else {
      console.log("signal is corrupt", signal);
    } 
  });

}

Harvester.prototype._harvest = function _harvest() {
  var self = this;
  if(!self._running) return;

  var metrics = this._collection._metrics;
  var now = Math.round( Date.now() / self.period ) * self.period

  for (var name in metrics) {
    var metric = metrics[name];
    var value =  metric.toJSON();

    if(typeof value === "object") {
      Object
        .keys(value)
        .forEach(function(prop) {
          var propName = name + '.' + prop;
          router.emit('publish', propName, value[prop], now, self.period);
        });
    } else {
      metric.reset();
      router.emit('publish', name, value, now, self.period);
    }
  }

};


