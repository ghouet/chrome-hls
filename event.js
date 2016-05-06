chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // dispatch based on command
  if (request.command == 'playM3u8') {
    var playerUrl = chrome.extension.getURL('player.html') + "#" + request.url
    chrome.tabs.create({ url: playerUrl });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    if (info.url.indexOf('.m3u8') != -1) {
      return {
        redirectUrl: "javascript:"
      };
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);