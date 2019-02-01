var hls;
var debug;
var twitch_enable;
var recoverDecodingErrorDate,recoverSwapAudioCodecDate;
var pendingTimedMetadata = [];

function handleMediaError(hls) {
  var now = performance.now();
  if(!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
    recoverDecodingErrorDate = performance.now();
    var msg = "trying to recover from media Error ..."
    console.warn(msg);
    hls.recoverMediaError();
  } else {
    if(!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
      recoverSwapAudioCodecDate = performance.now();
      var msg = "trying to swap Audio Codec and recover from media Error ..."
      console.warn(msg);
      hls.swapAudioCodec();
      hls.recoverMediaError();
    } else {
      var msg = "cannot recover, last media error recovery failed ..."
      console.error(msg);
    }
  }
}

function handleTimedMetadata(event, data) {
  for (var i = 0; i < data.samples.length; i++) {
    var pts = data.samples[i].pts;
    var str =  new TextDecoder('utf-8').decode(data.samples[i].data.subarray(22));
    pendingTimedMetadata.push({pts: pts, value: str});
  }
}

function timeUpdateCallback() {
  if (pendingTimedMetadata.length == 0 || pendingTimedMetadata[0].pts > video.currentTime) {
    return;
  }
  var e = pendingTimedMetadata[0];
  pendingTimedMetadata = pendingTimedMetadata.slice(1);
  console.log('Metadata ' + e.value + " at " + e.pts + "s");
}

function playM3u8(abs_path){
  var url = abs_path.split('#')[1];
  var twitch = abs_path.split('#')[2];
  var video = document.getElementById('video');
  var chat_div = document.getElementById("chat");
  chat_div.innerHTML = "";

  if(native){
    video.classList.add("native_mode");
    video.classList.remove("zoomed_mode");;
  } else {
    video.classList.remove("native_mode");
    video.classList.add("zoomed_mode");
  }

  if (twitch_enable == true && twitch != undefined && typeof twitch == "string"){
    video.className = "twitch_mode";
    var chat_iframe = document.createElement('iframe');
    chat_iframe.src = "https://www.twitch.tv/embed/" + twitch + "/chat";
    chat_iframe.scrolling = "yes";
    chat_iframe.frameBorder = "0";
    chat_iframe.id = "chat_embed";
    chat_iframe.width = "100%";
    chat_div.append(chat_iframe);
  }

  if(hls){ hls.destroy(); }
  hls = new Hls({debug:debug});
  hls.on(Hls.Events.ERROR, function(event,data) {
    var  msg = "Player error: " + data.type + " - " + data.details;
    console.error(msg);
    if(data.fatal) {
      switch(data.type) {
        case Hls.ErrorTypes.MEDIA_ERROR:
          handleMediaError(hls);
          break;
        case Hls.ErrorTypes.NETWORK_ERROR:
           console.error("network error ...");
          break;
        default:
          console.error("unrecoverable error");
          hls.destroy();
          break;
      }
    }
   });
  var m3u8Url = decodeURIComponent(url)
  hls.loadSource(m3u8Url);
  hls.attachMedia(video);
  video.ontimeupdate = timeUpdateCallback;
  hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
  });
  hls.on(Hls.Events.FRAG_PARSING_METADATA, handleTimedMetadata);
  document.title = url
}

chrome.storage.local.get({
  hlsjs: currentVersion,
  debug: false,
  native: false,
  twitch_enable: true
}, function(settings) {
  debug = settings.debug;
  native = settings.native;
  twitch_enable = settings.twitch_enable;
  var s = document.createElement('script');
  var version = currentVersion
  if (supportedVersions.includes(settings.hlsjs)) {
    version = settings.hlsjs
  }
  s.src = chrome.runtime.getURL('hlsjs/hls.'+version+'.min.js');
  // console.log(window.location.href.split("#"))
  s.onload = function() { playM3u8(window.location.href); };
  (document.head || document.documentElement).appendChild(s);
});

$(window).bind('hashchange', function() {
  playM3u8(window.location.href);
});