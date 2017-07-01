(function(){
  'use strict';

  var locked = false;

  var beforeUnloadHandler = function(event) {
    var message = 'dummy';
    (event || window.event).returnValue = message;
    return message;
  };

  var updateLock = function(locking, sendResponse) {
    if(locking) {
      locked = true;
      window.addEventListener('beforeunload', beforeUnloadHandler);
    } else {
      locked = false;
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
    sendResponse({locked:locked});
  };

  chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
      if(req !== undefined) {
        switch(req.command) {
        case 'query':
          sendResponse({locked: locked});
          break;
        case 'url':
          sendResponse({url: (document.location.origin + document.location.pathname)});
          break;
        case 'on':
          updateLock(true, sendResponse);
          break;
        case 'off':
          updateLock(false, sendResponse);
          break;
        case 'toggle':
          updateLock(!locked, sendResponse);
          break;
        default:
          return false;
        }
        return true;
      }
      return false;
    }
  );

  chrome.runtime.sendMessage({command:'check_url', url:(document.location.origin + document.location.pathname)}, function(res) {
    updateLock(res.matched, function() {});
    chrome.runtime.sendMessage({command:'update_status', locked:res.matched});
  });

})();
