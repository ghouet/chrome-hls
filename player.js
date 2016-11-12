var hls;
var debug;

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
  if(hls){ hls.destroy(); }
  var video = document.getElementById('video');
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

chrome.storage.sync.get({
  hlsjs: "0.5.52",
  debug: false
}, function(settings) {
  debug = settings.debug;
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('hls.'+settings.hlsjs+'.min.js');
  s.onload = function() { playM3u8(window.location.href.split("#")[1]); };
  (document.head || document.documentElement).appendChild(s);
});

$(window).bind('hashchange', function() {
  playM3u8(window.location.href.split("#")[1]);
});