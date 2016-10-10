var hls;

var recoverDecodingErrorDate,recoverSwapAudioCodecDate;
function handleMediaError() {
  var now = performance.now();
  if(!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
    recoverDecodingErrorDate = performance.now();
    console.warn("trying to recover from media Error ...");
    hls.recoverMediaError();
  } else {
    if(!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
      recoverSwapAudioCodecDate = performance.now();
      console.warn("trying to swap Audio Codec and recover from media Error ...");
      hls.swapAudioCodec();
      hls.recoverMediaError();
    } else {
      console.error("cannot recover, last media error recovery failed ...");
    }
  }
}

function playM3u8(url){
  if(Hls.isSupported()) {
      var video = document.getElementById('video');
      hls = new Hls();
      hls.on(Hls.Events.ERROR, function(event,data) {
        console.log("Player error: " + data.type + " - " + data.details);
        if(data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              handleMediaError();
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
}

playM3u8(window.location.href.split("#")[1]);