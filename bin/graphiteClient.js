var GraphiteClient = require('./../lib/client/graphite'),
    _ = require('underscore');

var DEFAULTS = {
  carbon: {
    host: 'localhost',
    port: 2003
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    filters: ['*']
  }
};

var config_location = process.env.GRAPHITE_CLIENT_CONFIG,
    config = _.extend(DEFAULTS, config_location && require(config_location) || {});

new GraphiteClient(config);
console.log('started Graphite client → ' + config.carbon.host + ':' + config.carbon.port);
