var testCase = require('nodeunit').testCase,
    FilePublisher = require('./../lib/publisher/filePublisher'),
    fs = require('fs'),
    router = require('./../lib/router');

module.exports = testCase({
  setUp: function(callback) {
    var self = this;

    fs.unlink('/tmp/metrics.log', function(err) {
      self.publisher = new FilePublisher({
        dir: '/tmp',
        filename: 'metrics.log'
      });

      callback();
   });
 },
  tearDown: function(callback) {
    var self = this;
    self.publisher.stop();
    fs.unlink('/tmp/metrics.log', function() {
      callback();
    });
  },

  // ============================================================================    
  "test config": function(test) {
  // ============================================================================    
    test.expect(3);
    test.ok(this.publisher);
    test.equals('/tmp', this.publisher.dir, 'dir property should be as configurated');
    test.equals('metrics.log', this.publisher.filename, 'firname property should be as configurated');
    test.done();
  },

  // ============================================================================    
  "test file creation": function(test) {
  // ============================================================================    
    test.expect(3);
   
    var self = this; 
    var logfilePath = this.publisher.dir + '/' + this.publisher.filename;
    
    fs.stat(logfilePath, function(err, stats) {
      test.ok(!err);
      test.ok(stats);
      test.ok(stats.isFile());
      test.done();
    });
   },

  // ============================================================================    
  "test publish": function(test) {
  // ============================================================================    
    test.expect(2);
   
    var self = this; 
    var logfilePath = this.publisher.dir + '/' + this.publisher.filename;
    var name = 'foo.bar';
    var value = 12;
    var date = Date.now;
    var period = 1000;
    var expected = JSON.stringify({ name: name, value: value, date: date, period: period }) + '\n';
   
    router.emit('publish', name, value, date, period);

    fs.readFile(logfilePath, 'utf-8', function(err, data) {
      test.ok(!err);
      console.log(expected, data);
      test.equals(expected, data);
      test.done();
    });
   },

  // ============================================================================    
  "test stop": function(test) {
  // ============================================================================    
    test.expect(1);
   
    var countBefore = router.listeners('publish').length;
    this.publisher.stop();   
    var countAfter = router.listeners('publish').length;

    test.equals(countBefore - 1, countAfter, 'should have successfully removed publisher listener');
    test.done();
   }
});

