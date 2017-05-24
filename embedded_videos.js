var videos = document.getElementsByTagName('video');
for (var i = 0; i < videos.length; i++) { 
	var video = videos[i]
	var srcs = new Array();
	if(video.getAttribute("src")){
		srcs.push(video.getAttribute("src"));
	}
	var sources = video.getElementsByTagName('source')
	for (var i = 0; i < sources.length; i++) {
		srcs.push(sources[i].getAttribute("src"));
	}
	for (var i = 0; i < srcs.length; i++) {
		var src = srcs[i]
		if(src.includes(".m3u8")){
	  		hls = new Hls();
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
	  		hls.loadSource(src);
	 		hls.attachMedia(video);
	  		hls.on(Hls.Events.MANIFEST_PARSED,function() { video.play(); });
	  	}
	}
}