// Keyhole is a socket.io SIGINT client consumer for the browser

var redis       = require('redis'),
    socketio    = require('socket.io'),
    connect     = require('connect'),
    _           = require('underscore');

var DEFAULT_OPTIONS = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    filters: ['*']
  },
  socketio: {
    port: 3000
  }
};

var redisClient = null,
    app = null;

function init(options) {
  options = _.extend(DEFAULT_OPTIONS, options || {});

  // configure connect to serve static files
  app = connect.createServer();
  app.use(connect.static(__dirname + '/public'));
  app.listen(options.socketio.port);

  // initialize socket.io
  io = socketio.listen(app);
  io.set('log level', 1); // reduce logging
  io.sockets.on('connection', onSocketConnection);

  wireUpRedis(options);
}

var wireUpRedis = function wireUpRedis(options) {
  redisClient = redis.createClient(options.redis.port, options.redis.host);
  redisClient.auth(options.redis.password, redisAuthCallback);

  redisClient.on('pmessage', function (pattern, channel, message) {
    redisHandleMessage(pattern, channel, message);
  });

  redisClient.on('message', function (channel, message) {
    redisHandleMessage(channel, channel, message);
  });
};

var redisAuthCallback = function authCallback(err, res) {
  if(err) {
    console.error('Redis Authentication Failed! BOOOOOOOOOM', err);
    throw err;
  }
};

var redisHandleMessage = function handleMessage (pattern, channel, message) {
  console.log('recieved', pattern, channel, message);
  io.sockets.in(pattern).emit('data', channel, message);
}

var onSocketConnection = function onSocketConnection(socket) {
  console.log('connected! ' + socket.id);
  socket.on('disconnect', function() {
    console.log('disconnected', socket.id);
  });

  socket.on('subscribe', function(filter) {
    console.log('subscribe ' + filter);

    if(io.sockets.clients(filter).length === 0)
      redisSubscribe(filter);
    socket.join(filter);
  });

  socket.on('unsubscribe', function(filter) {
    if(io.sockets.clients(filter).length === 1)
      redisUnsubscribe(filter);
    socket.leave(filter);
  })
};

var redisSubscribe = function redisSubscribe(filter) {
  console.log('redis subscribe', filter);
  if(filter.indexOf('*') === -1)
    redisClient.subscribe(filter);
  else
    redisClient.psubscribe(filter);
};

var redisUnsubscribe = function redisUnsubscribe(filter) {
  console.log('redis unsubscribe', filter);
  if(filter.indexOf('*') === -1)
    redisClient.unsubscribe(filter);
  else
    redisClient.punsubscribe(filter);
};

init();
