# Native HLS Extension

Allows HLS playback in chrome and firefox browsers

# Usage

1. Install extension from [chrome webstore][]/[mozilla addons][]
2. Click on any m3u8 link inside chrome/firefox to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

[chrome webstore]: https://chrome.google.com/webstore/detail/native-hls-playback/emnphkkblegpebimobpbekeedfgemhof
[mozilla addons]: https://addons.mozilla.org/en-US/firefox/addon/native_hls_playback/

# Some Developer Notes 

By default, the browser downloads any m3u8 files that were requested. This plugin checks any links to see if they are m3u8.
If that's the case, it opens a new tab on a video player that uses the [hlsjs][] library. This extension is just a wrapper of [hlsjs][] for chrome.

[hlsjs]: https://github.com/dailymotion/hls.js

#License
Released under [Apache 2.0 License](LICENSE)

