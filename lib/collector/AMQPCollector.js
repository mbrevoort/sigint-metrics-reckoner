var util = require('util'),
    amqp = require('amqp'),
    BSON = require('buffalo'),
    _ = require('underscore'),
    Collector = require('./collector');

module.exports = AMQPCollector;

//
// default options
//
var DEFAULTS = {
  host: 'localhost',
  exchangeName: 'sigint',
  queueName: 'listener'
};

function AMQPCollector(options) {
  this.options = _.extend(DEFAULTS, options || {});
  this._conn = null;
  this._exchange = null;
  this._queue = null;
  this._wireUp();
}

AMQPCollector.prototype.__proto__ = Collector.prototype;

AMQPCollector.prototype._wireUp = function _wireUp() {
  this._conn = amqp.createConnection({ host: this.options.host });
  this._conn.on('ready', this._onConnReady.bind(this));
};

AMQPCollector.prototype._onConnReady = function _onConnReady() {
  var name = this.options.exchangeName,
      options = { type: 'headers', durable: true },
      callback = this._onExchangeCreated.bind(this);

  this._conn.exchange(name, options, callback);
};

AMQPCollector.prototype._onExchangeCreated = function _onExchangeCreated(exchange) {
  util.log("Exchange created");
  this._exchange = exchange;

  var name = this.options.queueName,
      options =  { durable: true },
      callback = this._onQueue.bind(this);

  this._conn.queue(name, options, callback);
};

AMQPCollector.prototype._onQueue = function _onQueue(queue) {
  this._queue = queue;
  this._queue.bind(this._exchange, "*");
  var options = { ack: true, prefetchCount: 100}
  this._queue.subscribe(options, this._onMessage.bind(this));
};


AMQPCollector.prototype._onMessage = function _onMessage(message, headers, deliveryInfo) {

  var parsed = BSON.parse(message.data),
      node = parsed.s.n,
      app = parsed.s.a,
      type = parsed.t,
      op = parsed.o,
      value = parsed.d,
      metricName = [app, op].join('.'),
      metricNodeName = [app, node, op].join('.'),
      isCounter = (type === 'c'),
      isTimer = (type === 't');

  //util.log("EMISSION: " + util.inspect(parsed, true, 10));

  if(isCounter) {
    this.emitCounter(metricName, value);
    this.emitCounter(metricNodeName, value);
  } else if(isTimer) {
    this.emitTimer(metricName, value);
    this.emitTimer(metricNodeName, value);
  }

  this._queue.shift();
};
