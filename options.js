
function save_options() {
  var v = document.getElementById('hlsjsSel').value;
  var dbg = document.getElementById('cbDebug').checked;
  chrome.storage.sync.set({
    hlsjs: v,
    debug: dbg
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    hlsjs: "0.5.52",
    debug: false
  }, function(items) {
    document.getElementById('hlsjsSel').value = items.hlsjs;
    document.getElementById('cbDebug').checked = items.debug;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('saveSettings').addEventListener('click', save_options);