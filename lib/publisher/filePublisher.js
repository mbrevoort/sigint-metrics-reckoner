var router  = require('./../router'),
    fs = require('fs');

function FilePublisher(config) {
  this.dir = config.dir || process.cwd();
  this.filename = config.filename || 'metrics.log';
  this._id = Math.random();
  this._wireUp();
}

module.exports = FilePublisher;

/**
 * Stop the file publisher including unhooking any events
 * or listeners
 */
FilePublisher.prototype.stop = function stop() {
  if(this.stream) {
    this.stream.removeAllListeners();
    this.stream.end();
  }
  router.removeListener('publish', this._boundHandleMetric);
}

/**
 * Wireup any events or initialize
 * @api private
 */
FilePublisher.prototype._wireUp = function _wireUp() {

  // using this property to hold the scope bound function to 'this'
  // because calling this.func.bind(this) returns different function
  // references each time so that router.removeListener will not 
  // successfully remove the listener if it isn't called with the same
  // function reference
  this._boundHandleMetric = this._handleMetric.bind(this);
  router.on('publish', this._boundHandleMetric);
  this._openFileStream();
}

/**
 * Hook for publish metric events
 * @param name {string} the namespaced name of the metric
 * @param value {object|number}
 */
FilePublisher.prototype._handleMetric = function _handleMetric(name, value, date, period) {
  var payload = { name: name, value: value, date: date, period: period };
  this.stream.write(JSON.stringify(payload) + "\n");
	this.stream.flush();
}

/**
 * Open the File Stream 
 */
FilePublisher.prototype._openFileStream = function _openFileStream() {
  this.stream = fs.createWriteStream(this.dir + '/' + this.filename, {
  	flags: 'a',
  	encoding: 'utf8',
  	mode: 0666
  });
  this.stream.on('close', this._openFileStream.bind(this));
  this.stream.on('error', this._fileStreamError.bind(this));
}

/**
 * Handle File Stream errors, just log for now
 */ 
FilePublisher.prototype._fileStreamError = function _fileStreamError(err) {
  console.log('File Stream Error!', err);
}
