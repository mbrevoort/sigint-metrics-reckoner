var Collector = require('./../lib/collector/collector'),
    RedisPublisher = require('./../lib/publisher/redisPublisher'),
    FilePublisher = require('./../lib/publisher/filePublisher'),
    Harvester = require('./../lib/harvester');

var collector = new Collector();
new RedisPublisher({});
new FilePublisher({});
var harvester = new Harvester(1000).start();
var Wrapper = function(){};

var spawn = function(name, val, dur) {
  var wrapper = new Wrapper();
  wrapper.name = name;
  wrapper.maxValue = val;
  wrapper.maxDuration = dur;
  setTimeout(emit.bind(wrapper), rand(wrapper.maxDuration));
};

var emit = function emit() {
  var value = rand(this.maxValue);
  //console.log('emit', this.name, value);
  collector.emitCounter(this.name, value);
  setTimeout(emit.bind(this), rand(this.maxDuration));
};

var rand = function rand(max) {
  max = max || 10;
  return  Math.floor(Math.random() * max+1);
};

spawn('foo.bar', 10, 1);
spawn('foo.baz', 50, 1);
spawn('foo.bin', 750, 1);
spawn('foo.caz', 500, 1);
spawn('foo.daz', 8, 1);
spawn('foo.faz', 45, 1);
spawn('foo.gaz', 654, 1);
spawn('foo.haz', 8765, 1);


