chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // dispatch based on command
  if (request.command == 'playM3u8') {
    var playerUrl = chrome.extension.getURL('player.html') + "#" + request.url
    chrome.tabs.create({ url: playerUrl });
  }
});

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (info.url.split("?")[0].split("#")[0].endsWith("m3u8") && info.type == "main_frame") {
    	var playerUrl = chrome.extension.getURL('player.html') + "#" + info.url
    	return { redirectUrl:  playerUrl }
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);
