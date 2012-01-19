var _               = require('underscore'),
    AMQPCollector   = require('./../lib/collector/AMQPCollector'),
    RedisPublisher  = require('./../lib/publisher/redisPublisher'),
    FilePublisher   = require('./../lib/publisher/filePublisher'),
    Harvester       = require('./../lib/harvester');

//
// the default config
//
var DEFAULTS = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    prefix: "sigint.metrics."
  },
  amqp: {
    host: 'localhost',
    exchangeName: 'sigint',
    queueName: 'listener'
  },
  harvest_period: 10000
}

//
// Wire up the config
//
var config_location = process.env.RECKONER_CONFIG,
    config = _.extend(DEFAULTS, config_location && require(config_location) || {});

new AMQPCollector(config.amqp),
new Harvester(config.harvest_period).start();
new RedisPublisher(config.redis);
