var enabled = true;

function disableLinkCatcher(){
  enabled=false;
  chrome.browserAction.setIcon({path:"icon128grey.png"});
  chrome.browserAction.setTitle({title:"Enable"});
  console.log(enabled);
}

function enableLinkCatcher(){
  enabled=true;
  chrome.browserAction.setIcon({path:"icon128.png"});
  chrome.browserAction.setTitle({title:"Disable"});
}

chrome.browserAction.onClicked.addListener(function (){
  enabled ? disableLinkCatcher() : enableLinkCatcher();
});

chrome.webRequest.onBeforeRequest.addListener(	
  function(info) {
    if (enabled) {
      chrome.tabs.update(info.tabId, {url: chrome.extension.getURL('player.html') + "#" + info.url});
      return {cancel: true};
    }
  },
  {urls: ["*://*/*.m3u8*"], types:["main_frame"]},
  ["blocking"]
);