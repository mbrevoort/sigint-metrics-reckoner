var testCase = require('nodeunit').testCase,
    Collector = require('./../lib/collector/collector'),
    router = require('./../lib/router'),
    self = this;

module.exports = testCase({
  setUp: function(callback) {
    this.collector = new Collector();
    callback();
  },
  tearDown: function(callback) {
    callback();
  },

  // ============================================================================    
  "test base emit": function(test) {
  // ============================================================================    
    test.expect(5);
    
    var expected = {
      name: 'foo',
      value: 2,
      operation: 'inc',
      type: 'counter'
    };

    router.once('signal', function(signal) {
      test.ok(signal);
      test.equals(expected.name, signal.name);
      test.equals(expected.value, signal.value);
      test.equals(expected.operation, signal.operation);
      test.equals(expected.type, signal.type);
      test.done();
    });  
    
    this.collector.emit(expected.name, expected.value, expected.type, expected.operation);
   },

  // ============================================================================    
  "test emitCounter": function(test) {
  // ============================================================================    
    test.expect(5);
    
    var expected = {
      name: 'foo',
      value: 2,
      operation: 'inc',
      type: 'counter'
    };

    router.once('signal', function(signal) {
      test.ok(signal);
      test.equals(expected.name, signal.name);
      test.equals(expected.value, signal.value);
      test.equals(expected.operation, signal.operation);
      test.equals(expected.type, signal.type);
      test.done();
    });  
    
    this.collector.emitCounter(expected.name, expected.value);
   },

  // ============================================================================    
  "test emitMeter": function(test) {
  // ============================================================================    
    test.expect(5);
    
    var expected = {
      name: 'foo',
      value: 1,
      operation: 'mark',
      type: 'meter'
    };

    router.once('signal', function(signal) {
      test.ok(signal);
      test.equals(expected.name, signal.name);
      test.equals(expected.value, signal.value);
      test.equals(expected.operation, signal.operation);
      test.equals(expected.type, signal.type);
      test.done();
    });  
    
    this.collector.emitMeter(expected.name);
   },

    // ============================================================================    
  "test emitTimer": function(test) {
  // ============================================================================    
    test.expect(5);
    
    var expected = {
      name: 'foo',
      value: 2,
      operation: 'update',
      type: 'timer'
    };

    router.once('signal', function(signal) {
      test.ok(signal);
      test.equals(expected.name, signal.name);
      test.equals(expected.value, signal.value);
      test.equals(expected.operation, signal.operation);
      test.equals(expected.type, signal.type);
      test.done();
    });  
    
    this.collector.emitTimer(expected.name, expected.value);
   },

  // ============================================================================    
  "test emitHistogram": function(test) {
  // ============================================================================    
    test.expect(5);
    
    var expected = {
      name: 'foo',
      value: 213,
      operation: 'update',
      type: 'histogram'
    };

    router.once('signal', function(signal) {
      test.ok(signal);
      test.equals(expected.name, signal.name);
      test.equals(expected.value, signal.value);
      test.equals(expected.operation, signal.operation);
      test.equals(expected.type, signal.type);
      test.done();
    });  
    
    this.collector.emitHistogram(expected.name, expected.value);
   }
});
