var btn = document.getElementById('btnUpdate');
btn.addEventListener('click', updateState);
chrome.runtime.sendMessage("getState", function(enabled){
 	enabled ? btn.innerHTML = "Disable" : btn.innerHTML = "Enable";
});
function updateState() {
  chrome.runtime.sendMessage(btn.innerHTML);
  if (btn.innerHTML == "Enable") {
  	btn.innerHTML = "Disable"
  } else {
  	btn.innerHTML = "Enable"
  }
  window.close();
}