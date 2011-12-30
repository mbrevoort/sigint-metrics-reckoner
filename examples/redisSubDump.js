var redis = require('redis');


var client = redis.createClient();
client.on('pmessage', function (pattern, channel, message) {
    console.log("client channel " + channel + ": " + message);
});

client.psubscribe('foo.*');