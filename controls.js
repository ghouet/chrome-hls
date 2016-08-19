Number.prototype.toHHMMSS = function () {
    var sec_num = this;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

    var hstr = ""
    if (hours > 0 ){
    	if (hours  < 10) {hours   = "0"+hours;}
    	hstr += hours + ":"
    }
    if (seconds < 10) {seconds = "0"+seconds;}
    return hstr+minutes+':'+seconds;
}

// Video
var video = document.getElementById("video");

// Buttons
var playButton = document.getElementById("play-pause");
var muteButton = document.getElementById("mute");
var fullScreenButton = document.getElementById("full-screen");
var aspectButton = document.getElementById("aspect");

// Sliders
var seekBar = document.getElementById("seek-bar");
var volumeBar = document.getElementById("volume-bar");

var duration = document.getElementById("duration");
var currentTime = document.getElementById("current-time");

video.onplay = function() {
  playButton.classList.remove("play");
  playButton.classList.add("pause");
}
video.onpause = function() {
  playButton.classList.remove("pause");
  playButton.classList.add("play");
}

playButton.addEventListener("click", function() {
  if (video.paused == true) {
    video.play();
  } else {
    video.pause();
  }
});

muteButton.addEventListener("click", function() {
  if (video.muted == false) {
    video.muted = true;
  muteButton.classList.remove("volume-on");
  muteButton.classList.add("volume-off");
  } else {
    video.muted = false;
  muteButton.classList.remove("volume-off");
  muteButton.classList.add("volume-on");
  }
});

fullScreenButton.addEventListener("click", function() {
  video.webkitRequestFullscreen();
});

seekBar.addEventListener("change", function() {
  var time = video.duration * (seekBar.value / 100);
  video.currentTime = time;
});

video.addEventListener("timeupdate", function() {
  var value = (100 / video.duration) * video.currentTime;
  seekBar.value = value;
  currentTime.innerHTML = video.currentTime.toHHMMSS()
  duration.innerHTML = "/ " + video.duration.toHHMMSS()
});

seekBar.addEventListener("mousedown", function() {
  video.pause();
});
seekBar.addEventListener("mouseup", function() {
  video.play();
});
volumeBar.addEventListener("change", function() {
  video.volume = volumeBar.value;
});

aspectButton.addEventListener('click', function (event) {
    if(video.classList.contains("zoomed_mode")) {
      video.classList.remove("zoomed_mode");
      video.classList.add("native_mode");
      aspectButton.classList.remove("zoom-in");
      aspectButton.classList.add("zoom-out");
    } else {
      video.classList.remove("native_mode");
      video.classList.add("zoomed_mode");
      aspectButton.classList.remove("zoom-out");
      aspectButton.classList.add("zoom-in");
    }
 });

$(document).mousemove(function(){
  $('#video-controls').show();
  $('#video-controls').delay(3600).fadeOut();
});

$(document).hover(function(){
  $('#video-controls').show();
  $('#video-controls').delay(3600).fadeOut();
},function(){
  $('#video-controls').fadeOut();
});