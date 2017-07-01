(function() {
'use strict';

var dispatcher = function(url) {
  var extractor = function(str) {
    if(str[0]==='[') {
      var idx = str.search("]");
      if(idx!==-1) {
        return [str.slice(1,idx),str.slice(idx+1)];
      }
    }
    return ['',str];
  };
  var dispatch = {
    'exact': function(spec,url) {
      return url===spec;
    },
    'partial': function(spec,url) {
      return url.indexOf(spec)!==-1;
    },
    'regex': function(spec,url) {
      return url.match(spec)!==null;
    },
    '': function(spec,url) {
      return url.slice(0,spec.length)===spec;
    }
  };

  return function(spec) {
    var espec = extractor(spec);
    if(!(espec[0] in dispatch)) { espec[0]=''; }
    return dispatch[espec[0]](espec[1], url);
  };
}

var match = function(defaults, url) {
  return defaults.some(dispatcher(url));
};

var sanity_check = function(defaults) {
  var filtered = false, check = {}, results = [];
  defaults.forEach(function(ele){
    if(ele !== '' && !(ele in check)) {
      check[ele] = true;
      results.push(ele);
    } else {
      filtered = true;
    }
  });
  return {filtered:filtered, defaults:results};
};

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  switch(req.command) {
  case 'append_url':
    chrome.storage.local.get({defaults:[]}, function(conf) {
      if(conf.defaults.some(function(x) { return x===req.url })) {
        sendResponse({duplicated:true});
      } else {
        conf.defaults.push(req.url);
        chrome.storage.local.set({defaults:conf.defaults}, function() {
          sendResponse({duplicated:false});
        });
      }
    });
    return true;
  case 'check_url':
    chrome.storage.local.get({defaults:[]}, function(conf) {
      var matched = match(conf.defaults, req.url);
      sendResponse({matched:matched});
    });
    return true;
  case 'update_status':
    // TODO: shown by icon change
    chrome.browserAction.setBadgeText({text:(req.locked?'L':''),tabId:(req['tid']||sender.tab.id)});
    return false;
  case 'update_conf':
    var filtered = sanity_check(req.defaults);
    chrome.storage.local.set({defaults:filtered.defaults}, function() {
      sendResponse({defaults:filtered.defaults,status:(filtered.filtered?'filtered_message':'saved_message')});
    });
    return true;
  }
  return false;
});

})();
