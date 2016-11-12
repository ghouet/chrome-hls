(function() {
  'use strict';

/**
 * Constants of states for Chromecast device 
 **/
var DEVICE_STATE = {
  'IDLE' : 0, 
  'ACTIVE' : 1, 
  'WARNING' : 2, 
  'ERROR' : 3,
};

/**
 * Constants of states for CastPlayer 
 **/
var PLAYER_STATE = {
  'IDLE' : 'IDLE', 
  'LOADING' : 'LOADING', 
  'LOADED' : 'LOADED', 
  'PLAYING' : 'PLAYING',
  'PAUSED' : 'PAUSED',
  'STOPPED' : 'STOPPED',
  'SEEKING' : 'SEEKING',
  'ERROR' : 'ERROR'
};

var CastPlayer = function() {
  /* device variables */
  // @type {DEVICE_STATE} A state for device
  this.deviceState = DEVICE_STATE.IDLE;

  /* receivers available */
  // @type {boolean} A boolean to indicate availability of receivers
  this.receivers_available = false;

  /* Cast player variables */
  // @type {Object} a chrome.cast.media.Media object
  this.currentMediaSession = null;
  // @type {Number} volume
  this.currentVolume = 0.5;
  // @type {Boolean} A flag for autoplay after load
  this.autoplay = true;
  // @type {string} a chrome.cast.Session object
  this.session = null;
  // @type {PLAYER_STATE} A state for Cast media player
  this.castPlayerState = PLAYER_STATE.IDLE;

  /* Local player variables */
  // @type {PLAYER_STATE} A state for local media player
  this.localPlayerState = PLAYER_STATE.IDLE;
  // @type {HTMLElement} local player
  this.localPlayer = null;
  // @type {Boolean} Fullscreen mode on/off
  this.fullscreen = false;

  this.initializeCastPlayer();
  this.initializeLocalPlayer();
};

/**
 * Initialize local media player 
 */
CastPlayer.prototype.initializeLocalPlayer = function() {
  this.localPlayer = document.getElementById('video_element');
  this.localPlayer.addEventListener('loadeddata', this.onMediaLoadedLocally.bind(this));
};

/**
 * Initialize Cast media player 
 * Initializes the API. Note that either successCallback and errorCallback will be
 * invoked once the API has finished initialization. The sessionListener and 
 * receiverListener may be invoked at any time afterwards, and possibly more than once. 
 */
CastPlayer.prototype.initializeCastPlayer = function() {

  
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(this.initializeCastPlayer.bind(this), 2000);
    return;
  }
  // default set to the default media receiver app ID
  // optional: you may change it to point to your own
  var applicationID = "747BE7E6"
  //var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  
  // auto join policy can be one of the following three
  var autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
  //var autoJoinPolicy = chrome.cast.AutoJoinPolicy.PAGE_SCOPED;
  //var autoJoinPolicy = chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED;

  // request session
  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    this.sessionListener.bind(this),
    this.receiverListener.bind(this),
    autoJoinPolicy);

  chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.onError.bind(this));

  this.initializeUI();
};

/**
 * Callback function for init success 
 */
CastPlayer.prototype.onInitSuccess = function() {
  //console.log("init success");
  this.updateMediaControlUI();
};

/**
 * Generic error callback function 
 */
CastPlayer.prototype.onError = function(e) {
  //console.log("error", e);
};

/**
 * @param {!Object} e A new session
 * This handles auto-join when a page is reloaded
 * When active session is detected, playback will automatically
 * join existing session and occur in Cast mode and media
 * status gets synced up with current media of the session 
 */
CastPlayer.prototype.sessionListener = function(e) {
  this.session = e;
  if( this.session ) {
    this.deviceState = DEVICE_STATE.ACTIVE;
    if( this.session.media[0] ) {
      this.onMediaDiscovered('activeSession', this.session.media[0]);
    }
    else {
      this.loadMedia(mediaUrl);
    }
    this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
  }
}

/**
 * @param {string} e Receiver availability
 * This indicates availability of receivers but
 * does not provide a list of device IDs
 */
CastPlayer.prototype.receiverListener = function(e) {
  if( e === 'available' ) {
    this.receivers_available = true;
    this.updateMediaControlUI();
    //console.log("receiver found");
  }
  else {
    //console.log("receiver list empty");
  }
};

/**
 * session update listener
 */
CastPlayer.prototype.sessionUpdateListener = function(isAlive) {
  if (!isAlive) {
    this.session = null;
    this.deviceState = DEVICE_STATE.IDLE;
    this.castPlayerState = PLAYER_STATE.IDLE;
    this.currentMediaSession = null;

    var online = navigator.onLine;
    if( online == true ) {
      // continue to play media locally
      this.playMediaLocally();
      this.updateMediaControlUI();
    }
  }
};

/**
 * Requests that a receiver application session be created or joined. By default, the SessionRequest
 * passed to the API at initialization time is used; this may be overridden by passing a different
 * session request in opt_sessionRequest. 
 */
CastPlayer.prototype.launchApp = function() {
  //console.log("launching app...");
  chrome.cast.requestSession(
    this.sessionListener.bind(this),
    this.onLaunchError.bind(this));
  if( this.timer ) {
    clearInterval(this.timer);
  }
};

/**
 * Callback function for request session success 
 * @param {Object} e A chrome.cast.Session object
 */
CastPlayer.prototype.onRequestSessionSuccess = function(e) {
  //console.log("session success: " + e.sessionId);
  this.session = e;
  this.deviceState = DEVICE_STATE.ACTIVE;
  this.updateMediaControlUI();
  this.loadMedia(mediaUrl);
  this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
};

/**
 * Callback function for launch error
 */
CastPlayer.prototype.onLaunchError = function() {
  //console.log("launch error");
  this.deviceState = DEVICE_STATE.ERROR;
};

/**
 * Stops the running receiver application associated with the session.
 */
CastPlayer.prototype.stopApp = function() {
  this.session.stop(this.onStopAppSuccess.bind(this, 'Session stopped'),
      this.onError.bind(this));    

};

/**
 * Callback function for stop app success 
 */
CastPlayer.prototype.onStopAppSuccess = function(message) {
  //console.log(message);
  this.deviceState = DEVICE_STATE.IDLE;
  this.castPlayerState = PLAYER_STATE.IDLE;
  this.currentMediaSession = null;
  clearInterval(this.timer);

  // continue to play media locally
  //console.log("current time: " + this.currentMediaTime);
  this.playMediaLocally();
  this.updateMediaControlUI();
};

/**
 * Loads media into a running receiver application
 * @param {Number} mediaIndex An index number to indicate current media content
 */
CastPlayer.prototype.loadMedia = function(url) {
  if (!this.session) {
    //console.log("no session");
    return;
  }
  //console.log("loading " + url);
  var mediaInfo = new chrome.cast.media.MediaInfo(url);

  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
  mediaInfo.contentType = 'vapplication/vnd.apple.mpegurl';

  mediaInfo.metadata.title = url;
  
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = this.autoplay;
  if( this.localPlayerState == PLAYER_STATE.PLAYING ) {
    request.currentTime = this.localPlayer.currentTime;
    this.localPlayer.pause();
    this.localPlayerState = PLAYER_STATE.STOPPED;
    this.localPlayer.removeAttribute("controls")
  }
  else {
    request.currentTime = 0;
  } 

  this.castPlayerState = PLAYER_STATE.LOADING;
  this.session.loadMedia(request,
    this.onMediaDiscovered.bind(this, 'loadMedia'),
    this.onLoadMediaError.bind(this));
};

/**
 * Callback function for loadMedia success
 * @param {Object} mediaSession A new media object.
 */
CastPlayer.prototype.onMediaDiscovered = function(how, mediaSession) {
  //console.log("new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
  this.currentMediaSession = mediaSession;
  if( how == 'loadMedia' ) {
    if( this.autoplay ) {
      this.castPlayerState = PLAYER_STATE.PLAYING;
    }
    else {
      this.castPlayerState = PLAYER_STATE.LOADED;
    }
  }

  if( how == 'activeSession' ) {
    this.castPlayerState = this.session.media[0].playerState; 
    this.currentMediaTime = this.session.media[0].currentTime; 
  }

  if( this.castPlayerState == PLAYER_STATE.PLAYING ) {}

  this.currentMediaSession.addUpdateListener(this.onMediaStatusUpdate.bind(this));

  if( this.localPlayerState == PLAYER_STATE.PLAYING ) {
    this.localPlayerState == PLAYER_STATE.STOPPED;
    this.localPlayer.style.display = 'none';
  }
  // update UIs
  this.updateMediaControlUI();
};

/**
 * Callback function when media load returns error 
 */
CastPlayer.prototype.onLoadMediaError = function(e) {
  //console.log(e);
  this.castPlayerState = PLAYER_STATE.IDLE;
  // update UIs
  this.updateMediaControlUI();
};

/**
 * Callback function for media status update from receiver
 * @param {!Boolean} e true/false
 */
CastPlayer.prototype.onMediaStatusUpdate = function(e) {
  if( e == false ) {
    this.currentMediaTime = 0;
    this.castPlayerState = PLAYER_STATE.IDLE;
  }
  //console.log("updating media");
  this.updateMediaControlUI();
};

/**
 * Play media in local player
 */
CastPlayer.prototype.playMediaLocally = function() {
  
  this.localPlayer.style.display = 'block';
  if( this.localPlayerState != PLAYER_STATE.PLAYING && this.localPlayerState != PLAYER_STATE.PAUSED ) { 
    if(Hls.isSupported()) {
      var video = document.getElementById('video_element');
      var hls = new Hls();
      video.src = mediaUrl
      var m3u8Url = decodeURIComponent(mediaUrl)
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
      document.title = mediaUrl
    }
  }
  else {
    this.localPlayer.play();
  }
  this.localPlayerState = PLAYER_STATE.PLAYING;
  this.updateMediaControlUI();
};

/**
 * Callback when media is loaded in local player 
 */
CastPlayer.prototype.onMediaLoadedLocally = function() {
  this.localPlayer.play();
  this.localPlayer.setAttribute("controls","")
};

/**
 * Play media in Cast mode 
 */
CastPlayer.prototype.playMedia = function() {
  if( !this.currentMediaSession ) {
    this.playMediaLocally();
    return;
  }

  switch( this.castPlayerState ) 
  {
    case PLAYER_STATE.LOADED:
    case PLAYER_STATE.PAUSED:
      this.currentMediaSession.play(null, 
        this.mediaCommandSuccessCallback.bind(this,"playing started for " + this.currentMediaSession.sessionId),
        this.onError.bind(this));
      this.currentMediaSession.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      this.castPlayerState = PLAYER_STATE.PLAYING;
      break;
    case PLAYER_STATE.IDLE:
    case PLAYER_STATE.LOADING:
    case PLAYER_STATE.STOPPED:
      this.loadMedia(mediaUrl);
      this.currentMediaSession.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      this.castPlayerState = PLAYER_STATE.PLAYING;
      break;
    default:
      break;
  }
  this.updateMediaControlUI();
};


/**
 * Callback function for media command success 
 */
CastPlayer.prototype.mediaCommandSuccessCallback = function(info, e) {
  ////console.log(info);
};

/**
 * Update media control UI components based on localPlayerState or castPlayerState
 */
CastPlayer.prototype.updateMediaControlUI = function() {
  var playerState = this.deviceState == DEVICE_STATE.ACTIVE ? this.castPlayerState : this.localPlayerState;
  switch ( playerState )
  {
    case PLAYER_STATE.LOADED:
    case PLAYER_STATE.PLAYING:
      break;
    case PLAYER_STATE.PAUSED:
    case PLAYER_STATE.IDLE:
    case PLAYER_STATE.LOADING:
    case PLAYER_STATE.STOPPED:
      break;
    default:
      break;
  }

  if( !this.receivers_available ) {
    document.getElementById("casticonactive").style.display = 'none';
    document.getElementById("casticonidle").style.display = 'none';
    return;
  }

  if( this.deviceState == DEVICE_STATE.ACTIVE ) {
    document.getElementById("casticonactive").style.display = 'block';
    document.getElementById("casticonidle").style.display = 'none';
  }
  else {
    document.getElementById("casticonidle").style.display = 'block';
    document.getElementById("casticonactive").style.display = 'none';
  }
}

/**
 * Initialize UI components and add event listeners 
 */
CastPlayer.prototype.initializeUI = function() {
  // add event handlers to UI components
  document.getElementById("casticonidle").addEventListener('click', this.launchApp.bind(this));
  document.getElementById("casticonactive").addEventListener('click', this.launchApp.bind(this));
};
 window.CastPlayer = CastPlayer;
})();


var castPlayer = new CastPlayer();
var mediaUrl = window.location.href.split("#")[1]
castPlayer.loadMedia(mediaUrl)
castPlayer.playMediaLocally();
