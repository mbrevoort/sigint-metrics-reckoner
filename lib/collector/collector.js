var router        = require('./../router');

function Collector() {
}

module.exports = Collector;

Collector.prototype.emitCounter = function(name, value) {
  var operation = (value < 0) ? 'dec' : 'inc';
  this.emit(name, value || 1, 'counter', operation);
}

Collector.prototype.emitMeter = function emitMeter(name, value) {
  this.emit(name, value || 1, 'meter', 'mark');
}

Collector.prototype.emitHistogram = function emitHistogram(name, value) {
  this.emit(name, value, 'histogram', 'update');
}

Collector.prototype.emitTimer = function emitTimer(name, value) {
  this.emit(name, value, 'timer', 'update');
}

Collector.prototype.emit = function emit(name, value, type, operation) {
  var signal = {
    name: name,
    type: type,
    operation: operation,
    value: value
  };
  router.emit('signal', signal);
}
