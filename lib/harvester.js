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
    //console.log(signal);

    var isTypeValid = signal.type && signal.type.match(/(timer|counter|histogram|meter)/);
    // TODO more validation
    if (isTypeValid && signal.operation && signal.value && signal.name) {
      var name = signal.name + '.' + signal.type;
      var metricFunction = self._collection[signal.type];
      var metricInstance = metricFunction && metricFunction.bind(self._collection)(name);
      var metricOperation = metricInstance && metricInstance[signal.operation];

      //console.log(metricFunction, metricInstance, metricOperation);

      if (metricOperation) {
        metricOperation.bind(metricInstance)(signal.value);
      } else {
        console.error('signal is corrupt or the metric was reported for a different metric type previoulsy', signal);
      }

    } else {
      console.log("signal is corrupt", signal);
    }
  });

}

Harvester.prototype._harvest = function _harvest() {
  var self = this;
  if(!self._running) return;

  var metrics = this._collection._metrics;

  for (var name in metrics) {
    var metric = metrics[name];
    var value =  metric.toJSON();
    self._publish(name, value, metric);
 }

};

Harvester.prototype._publish = function _publish(name, value, metric) {
  var self = this;
  var now = Math.round( Date.now() / self.period ) * self.period

  if(typeof value === "object") {
    Object
      .keys(value)
      .forEach(function(prop) {
        var propName = name + '.' + prop;
        self._publish(propName, value[prop]);
      });
  } else if (typeof value === "number") {
    metric && metric.reset();
    router.emit('publish', name, value, now, self.period);
  } else {
    console.log("Ignored", name, value);
  }
}
