var AMQPCollector = require('./../lib/collector/AMQPCollector'),
    collector = new AMQPCollector(),
    RedisPublisher = require('./../lib/publisher/redisPublisher'),
    FilePublisher = require('./../lib/publisher/filePublisher'),
    Harvester = require('./../lib/harvester');

new RedisPublisher({});
new FilePublisher({});
new Harvester(1000).start();
