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
    test.expect(7);
   
    var self = this; 
    var expectedValue = 2;
    var expectedName = 'foo.metric';

    router.once('publish', function(name, value) {
      test.ok(name);
      test.ok(value);
      test.equals(expectedValue*2, value);
      test.equals(expectedName, name);

      router.once('publish', function(name, value) {
        test.ok(name);
        test.equals(expectedName, name);
        test.equals(0, value, 'value should be 0 because the counter was cleared');
        self.harvester.stop();
        test.done();
      });
    });

    this.collector.emitCounter(expectedName, expectedValue);
    this.collector.emitCounter(expectedName, expectedValue);
   },

  // ============================================================================    
  "test Meter publish": function(test) {
  // ============================================================================    
    test.expect(1);
    var now = Date.now();
   
    var self = this; 
    var expectedValue = 2;
    var metricName = 'foo.meter';
    var expectedName = 'foo.meter.count';

    var callback = function(name, value) {

      if(name === expectedName) {
        test.equals(expectedValue, value);
        self.harvester.stop();
        router.removeListener('publish', callback);
        test.done();
      }
    
    };

    router.on('publish', callback);

    this.collector.emitMeter(metricName);
    this.collector.emitMeter(metricName);
   }  
});
