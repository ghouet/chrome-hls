var hls;
var debug;
var currentVersion = "0.8.5";
var supportedVersions = ["0.5.52", "0.6.21","0.7.3","0.7.4", "0.7.7", "0.7.8", "0.7.9", "0.7.10", "0.8.0", "0.8.1", "0.8.2", "0.8.5"]
var recoverDecodingErrorDate,recoverSwapAudioCodecDate;
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

function playM3u8(url){
  var video = document.getElementById('video');
  if(native){
    video.classList.add("native_mode");
    video.classList.remove("zoomed_mode");
  } else {
    video.classList.remove("native_mode");
    video.classList.add("zoomed_mode");
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
  hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
  });
  document.title = url
}

chrome.storage.local.get({
  hlsjs: currentVersion,
  debug: false,
  native: false
}, function(settings) {
  debug = settings.debug;
  native = settings.native;
  var s = document.createElement('script');
  var version = currentVersion
  if (supportedVersions.includes(settings.hlsjs)) {
    version = settings.hlsjs
  }
  s.src = chrome.runtime.getURL('hls.'+version+'.min.js');
  s.onload = function() { playM3u8(window.location.href.split("#")[1]); };
  (document.head || document.documentElement).appendChild(s);
});

$(window).bind('hashchange', function() {
  playM3u8(window.location.href.split("#")[1]);
});