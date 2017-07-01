(function() {
'use strict';

var save_options = function() {
  var value = document.getElementById('defaults').value;
  var defaults = value===''?[]:value.split('\n');
  chrome.runtime.sendMessage({command:'update_conf',defaults:defaults}, function(res) {
    document.getElementById('defaults').value = res.defaults.join('\n');

    var status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage(res.status);
    setTimeout(function() { status.textContent = ''; }, 750);
  });
};

var restore_options = function() {
  chrome.storage.local.get({defaults:''}, function(res) {
    document.getElementById('defaults').value = res.defaults.join('\n');
  });
};

var spec = [
  'defaults_label',
  'save'
];
var set_messages = function() {
  for(var i = 0; i < spec.length; ++i) {
    var ele = document.getElementById(spec[i]);
    ele.innerHTML = chrome.i18n.getMessage(spec[i]);
  }
};

document.addEventListener('DOMContentLoaded', restore_options);
document.addEventListener('DOMContentLoaded', set_messages);
document.getElementById('save').addEventListener('click', save_options);

})();
