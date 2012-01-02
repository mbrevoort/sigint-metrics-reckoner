var EventEmitter = require('events').EventEmitter;

// The Router serves as an event switchboard for the metrics reckoner.

function Router() {
}


Router.prototype.__proto__ = EventEmitter.prototype;
module.exports = new Router();


