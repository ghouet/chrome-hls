var enabled = true;

function disableLinkCatcher(){
  enabled=false;
  chrome.browserAction.setIcon({path:"icon128grey.png"});
  chrome.browserAction.setTitle({title:"Enable"});
}

function enableLinkCatcher(){
  enabled=true;
  chrome.browserAction.setIcon({path:"icon128.png"});
  chrome.browserAction.setTitle({title:"Disable"});
}

chrome.browserAction.onClicked.addListener(function (){
  if(enabled==false){
      enableLinkCatcher();
  }else{
      disableLinkCatcher();
  }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // dispatch based on command
  if (request.command == 'playM3u8') {
    var playerUrl = chrome.extension.getURL('player.html') + "#" + request.url
    chrome.tabs.create({ url: playerUrl });
  }
});

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (enabled && info.url.split("?")[0].split("#")[0].endsWith("m3u8") && info.type == "main_frame") {
      var playerUrl = chrome.extension.getURL('player.html') + "#" + info.url
      return { redirectUrl:  playerUrl }
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);