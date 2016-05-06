document.addEventListener('click', function(evt) {
  console.log(evt);
  if (evt.target.href && evt.target.href.indexOf("m3u8") > 0 ) {
    evt.preventDefault();
    evt.stopPropagation();

    chrome.extension.sendMessage({command: 'playM3u8', url: evt.target.href}, function(response) {});
    
    /*if(evt.target.target == "_blank") {
      
    } else{
      document.body.style.backgroundColor = "black";
      document.body.innerHTML = '<video id="video" style="width:100%;height:100%"></video>'
      playM3u8(evt.target.href)
    }*/
  }
});