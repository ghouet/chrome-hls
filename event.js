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

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (enabled && info.url.split("?")[0].split("#")[0].endsWith("m3u8") && info.type == "main_frame") {
      chrome.tabs.update(info.tabId, {url: chrome.extension.getURL('player.html') + "#" + info.url});
      return {cancel: true};
    }
  },
  {urls: ["http://*/*"]},
  ["blocking"]
);

/*chrome.webRequest.onHeadersReceived.addListener(  
  function(info) {
    var ct = info.responseHeaders.filter(function(v){ return v.name.toLowerCase()=="content-type" })[0].value.toLowerCase();
    if (enabled && ct == "application/x-mpegurl" && info.type == "main_frame") {
      chrome.tabs.update(info.tabId, {url: chrome.extension.getURL('player.html') + "#" + info.url});
      return {cancel: true};
    }
  },
  {urls: ["<all_urls>"]]},
  ["responseHeaders", "blocking"]
);*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // dispatch based on command
  if (request.command == 'playM3u8') {
    chrome.tabs.create({ url: chrome.extension.getURL('player.html') + "#" + request.url });
  }
});