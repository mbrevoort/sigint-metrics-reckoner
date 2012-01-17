var testCase = require('nodeunit').testCase,
    Harvester = require('./../lib/harvester'),
    Collector = require('./../lib/collector/collector'),
    router = require('./../lib/router');

module.exports = testCase({
  setUp: function(callback) {
    this.harvester = new Harvester(25).start();
    this.collector = new Collector();
    callback();
  },
  tearDown: function(callback) {
    router.removeAllListeners();
    callback();
  },

  // ============================================================================
  "test Counter publish": function(test) {
  // ============================================================================
    test.expect(9);

    var self = this;
    var expectedValue = 2;

    router.once('publish', function(name, payload) {
      test.ok(name);
      test.ok(payload);
      test.equals(4, payload.value);
      test.equals('foo.metric.counter', name);
      test.equals('foo.metric.counter', payload.name);
      test.equals('counter', payload.type);


      // since we're not publishing metrics passed the 1st period, the next period
      // publish should have a zero value associated with it.
      router.once('publish', function(name, payload) {
        test.ok(name);
        test.equals('foo.metric.counter', name);
        test.equals(0, payload.value, 'value should be 0 because the counter was cleared');
        self.harvester.stop();
        test.done();
      });
    });

    this.collector.emitCounter('foo.metric', 2);
    this.collector.emitCounter('foo.metric', 2);
   },

  // ============================================================================
  "test Meter publish": function(test) {
  // ============================================================================
    test.expect(3);
    var now = Date.now();

    var self = this;
    var expectedValue = 2;
    var metricName = 'foo.meter';

    var callback = function(name, payload) {

      // TODO test more aspects of the meter

      test.equals(2, payload.value.count);
      test.equals('foo.meter.meter', payload.name);
      test.equals('meter', payload.type)
      self.harvester.stop();
      router.removeListener('publish', callback);
      test.done();

    };

    router.on('publish', callback);

    this.collector.emitMeter(metricName);
    this.collector.emitMeter(metricName);
   },

  /*
  // ============================================================================
  "test Timer publish": function(test) {
  // ============================================================================
    test.expect(1);
    var now = Date.now();

    var self = this;
    var metricName = 'foo.timer';

    var callback = function(name, value) {
      console.log(name, value);
      if(name === 'foo') {
        test.equals(expectedValue, value);
        self.harvester.stop();
        router.removeListener('publish', callback);
        test.done();
      }
    };

    router.on('publish', callback);

    this.collector.emitTimer(metricName, 10);
    this.collector.emitTimer(metricName, 10);
  }
*/
});
