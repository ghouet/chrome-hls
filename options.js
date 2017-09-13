var current_version = "0.8.2"

function save_options() {
  var v = document.getElementById('hlsjsSel').value;
  var dbg = document.getElementById('cbDebug').checked;
  var ntv = document.getElementById('cbNative').checked;
  chrome.storage.local.set({
    hlsjs: v,
    debug: dbg,
    native: ntv
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.local.get({
    hlsjs: current_version,
    debug: false,
    native: false
  }, function(items) {
    document.getElementById('hlsjsSel').value = items.hlsjs;
    document.getElementById('cbDebug').checked = items.debug;
    document.getElementById('cbNative').checked = items.native;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('saveSettings').addEventListener('click', save_options);