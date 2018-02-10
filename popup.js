var btnUpdate = document.getElementById('btnUpdate');
btnUpdate.addEventListener('click', updateState);
chrome.runtime.sendMessage("getState", function(enabled){
 	enabled ? btnUpdate.innerHTML = "Disable" : btnUpdate.innerHTML = "Enable";
});
function updateState() {
  chrome.runtime.sendMessage(btnUpdate.innerHTML);
  if (btnUpdate.innerHTML == "Enable") {
  	btnUpdate.innerHTML = "Disable"
  } else {
  	btnUpdate.innerHTML = "Enable"
  }
  window.close();
}

document.getElementById('btnSettings').addEventListener('click', function(){
	chrome.runtime.openOptionsPage();
});

document.getElementById('btnPlayHlS').addEventListener('click', play_videos);

function play_videos(){
  chrome.tabs.executeScript(null, {
      file: 'hls.'+current_version+'.min.js'
  }, function() {
      chrome.tabs.executeScript(null, {file: 'embedded_videos.js'});
      window.close();
  });
}