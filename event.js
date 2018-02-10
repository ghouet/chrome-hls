var enabled = true;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){ 
      if (request == "getState") {
        sendResponse(enabled);
      } else {
        enabled = request == "Enable";
        enabled ? chrome.browserAction.setIcon({path:"img/icon128.png"}) : chrome.browserAction.setIcon({path:"img/icon128grey.png"})
      }
    }
);

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (enabled && info.url.split("?")[0].split("#")[0].endsWith(".m3u8")) {
      var playerUrl = chrome.runtime.getURL('player.html') + "#" + info.url
      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
        chrome.tabs.update(info.tabId, {url: playerUrl});
        return {cancel: true}
      } else {
        return { redirectUrl:  playerUrl }
      }
    }
  },
  {urls: ["*://*/*.m3u8*"], types:["main_frame"]},
  ["blocking"]
);

chrome.omnibox.onInputEntered.addListener(function (input){
    var playerUrl = chrome.runtime.getURL('player.html') + "#" + input;
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, {url: playerUrl});
    });
});
