var enabled = true;

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){ 
      if (request == "getState") {
        sendResponse(enabled);
      } else {
        enabled = request == "Enable";
        enabled ? chrome.browserAction.setIcon({path:"icon128.png"}) : chrome.browserAction.setIcon({path:"icon128grey.png"})
      }
    }
);

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (enabled && info.url.split("?")[0].split("#")[0].endsWith("m3u8")) {
      chrome.tabs.update(info.tabId, {url: chrome.extension.getURL('player.html') + "#" + info.url});
      return {cancel: true}
    }
  },
  {urls: ["*://*/*.m3u8*"], types:["main_frame"]},
  ["blocking"]
);