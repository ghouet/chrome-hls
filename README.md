# Chrome HLS Extension

Allows HLS playback in chrome browser

# Usage

1. Install extension from [webstore][]
2. Click on any m3u8 link inside chrome to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

[webstore]: https://chrome.google.com/webstore/detail/native-hls-playback/emnphkkblegpebimobpbekeedfgemhof

# Some Developer Notes 

By default, chrome download any m3u8 files that it will get. This plugin checks links to see if there are m3u8.
When that's the case, it opens a new tab on a video player that uses the [hlsjs][] library. This extension is just a wrapper of [hlsjs][] for chrome.

[hlsjs]: https://github.com/dailymotion/hls.js

# TODOs

1. Play video element with an m3u8 source using hlsjs

#License
Released under [Apache 2.0 License](LICENSE)

