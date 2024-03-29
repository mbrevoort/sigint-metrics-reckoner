// Usage:
//
// Global variable KEYHOLE
//
// To subscribe:
//     KEYHOLE.subscribe('app1.app1node0.validate_idm_token.*')
//
// To unsubscribe:
//     KEYHOLE.subscribe('app1.app1node0.validate_idm_token.*')
//
// To register a data handler:
//     KEYHOLE.onData(function(channel, data) {});
//

(function(global) {
  var serverRoot = getServerRoot();
  var elem = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = serverRoot + '/socket.io/socket.io.js';
  elem.appendChild(script);

  // doesn't work for IE6 & 7 but oh well
  script.onload = function() {
    var socket = io.connect(serverRoot);
    window.KEYHOLE = {};
    window.KEYHOLE.subscribe = function subscribe(filter) {
      socket.emit('subscribe', filter);
      return window.SIGINIT;
    };

    window.KEYHOLE.unsubscribe = function unsubscribe(filter) {
      socket.emit('unsubscribe', filter);
      return window.SIGINIT;
    };

    window.KEYHOLE.onData = function onData(fn) {
      socket.on('data', function(channel, message) {
        fn(channel, message);
      });
    };
 };

  function getServerRoot() {
    var script_elements = document.getElementsByTagName('script')
      , this_script
      , attr
      , i = script_elements.length;

    while(i--) {
      if ((script_elements[i].getAttribute("src") || "").indexOf("/keyhold.js") > 0) {
        this_script = script_elements[i];
        break;
      }
    }

    var match_absolute = this_script.getAttribute("src").match(new RegExp('https?://[^/]*'))
    return (match_absolute && match_absolute[0]) || window.location.protocol + "//" + window.location.host
  }

})(window || this);

