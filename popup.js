(function() {
'use strict';

var spec = [
  'lock_label',
  'default_label',
  'options_label'
];

document.addEventListener('DOMContentLoaded', function() {
  for(var i = 0; i < spec.length; ++i) {
    var ele = document.getElementById(spec[i]);
    ele.innerHTML = chrome.i18n.getMessage(spec[i]);
  }

  var status = document.getElementById('status');
  var setStatus = function() {
    var args = [].slice.call(arguments);
    var sticky = false;
    if(typeof args[0] === 'boolean') {
      sticky = args[0];
      args.shift();
    }
    status.textContent = chrome.i18n.getMessage.apply(this, args);
    if(!sticky) {
      setTimeout(function() { status.textContent=''; }, 750);
    }
  };

  var elem_locked = document.getElementById('locked');
  chrome.tabs.query({active:true,currentWindow:true}, function(res) {
    var tid = res[0].id;
    var update_locked = function(locked) {
      if(locked) {
        elem_locked.classList.add('locked');
      } else {
        elem_locked.classList.remove('locked');
      }
      chrome.runtime.sendMessage({command:'update_status', locked:locked, tid:tid});
    };
    var rlog = function(message) {
      chrome.tabs.executeScript(tid, { code: 'console.log("'+tid+' '+message+'");' }, function() {});
    };

    document.getElementById('lock').addEventListener('click', function() {
      chrome.tabs.sendMessage(tid, {command:'toggle'}, function(res) {
        update_locked(res.locked);
      });
    });

    document.getElementById('default').addEventListener('click', function() {
      chrome.tabs.sendMessage(tid, {command:'url'}, function(res) {
        chrome.runtime.sendMessage({command:'append_url', url:res.url}, function(res) {
            if(res.duplicated) {
              setStatus('already_added');
            } else {
              setStatus('added');
            }
        });
      });
    });

    document.getElementById('options').addEventListener('click', function() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });

    chrome.tabs.sendMessage(tid, {command:'query'}, function(res) {
      // TODO: explicitly disable when undefined
      if(res) {
        update_locked(res.locked);
      } else {
        setStatus(true, 'invalid');
      }
    });

  });
});

})();
