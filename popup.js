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