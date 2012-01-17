var testCase = require('nodeunit').testCase,
    RedisPublisher = require('./../lib/publisher/redisPublisher'),
    redis = require('redis'),
    fs = require('fs'),
    router = require('./../lib/router');

module.exports = testCase({
  setUp: function(callback) {
    callback();
  },
  tearDown: function(callback) {
    callback();
  },

  // ============================================================================    
  "test config": function(test) {
  // ============================================================================    
    test.expect(4);
    var stats = {};
    mockRedis(stats);

    var options = {
      redis: {
        host: '127.0.0.1',
        port: 9999,
        password: 'foo'
      }
    };

    var publisher = new RedisPublisher(options);

//    test.ok(err);
//    test.ok((err + "").indexOf('ECONNREFUSED') > -1, 'connect to redis expected to fail');
    test.ok(publisher);
    test.equals(options.redis.host, publisher.options.redis.host, 'host properly configured');
    test.equals(options.redis.port, publisher.options.redis.port, 'port properly configured');
    test.equals(options.redis.password, publisher.options.redis.password, 'password properly configured');
    unmockRedis(stats);
    test.done();

  },

  // ============================================================================    
  "test publish": function(test) {
  // ============================================================================    
    test.expect(4);
    var stats = {};
    mockRedis(stats); 

    var publisher = new RedisPublisher();
    var name = 'foo.bar';
    var date = Date.now();
    var period = 1000;
    var payload = { value: 2, date: date, period: period };
    var expected = JSON.stringify(payload);

    router.emit('publish', name, payload);

    setTimeout(function() {
      test.equals(stats.calledPublish, 1);
      test.ok(stats.lastPublished);
      test.equals(expected, stats.lastPublished.payload);
      test.equals(name, stats.lastPublished.name);
      unmockRedis(stats);
      test.done();
    }, 10);
   },

  // ============================================================================    
  "test stop": function(test) {
  // ============================================================================    
    test.expect(2);
    var stats = {};
    mockRedis(stats);

    var publisher = new RedisPublisher();

    var countBefore = router.listeners('publish').length;
    publisher.stop();
    var countAfter = router.listeners('publish').length;

    test.equals(countBefore - 1, countAfter, 'should have successfully removed publisher listener');
    test.equals(1, stats.calledEnd);
    unmockRedis(stats);
    test.done();

  }
});

function mockRedis(stats) {
    stats._id = stats._id || Math.random();
    stats.__redisCreateClient = redis.createClient;
    redis.createClient = function() {
      return {
        end: function(){stats.calledEnd = stats.calledEnd + 1 || 1},
        publish: function(name, payload){
          stats.calledPublish = stats.calledPublish + 1 || 1;
          stats.lastPublished = {
            name: name,
            payload: payload
          };
        },
        auth: function(){stats.calledAuth = stats.calledAuth + 1 || 1}
      }; 
    };
}

function unmockRedis(stats) {
  redis.createClient = stats.__redisCreateClient;
}

