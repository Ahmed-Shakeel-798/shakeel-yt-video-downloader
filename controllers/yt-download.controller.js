const ytdl = require('ytdl-core');

class YtDownloadController {
    constructor() {
        
    }

    async getVideoInfo(URL) {

        // Get info about the video
        let info = await ytdl.getInfo(URL);  

        // Parse that info
        let formats = info.player_response.streamingData.formats;

        let parsedFormats = [];
        
        for (const format of formats) {
            parsedFormats.push({
                itag: format.itag,
                quality: format.qualityLabel,
                bitrate: format.bitrate,
                format: format.mimeType.substring(0,format.mimeType.indexOf('/')),
                ext: format.mimeType.substring(format.mimeType.indexOf('/')+1,format.mimeType.indexOf(';')),
            })
        }
        
        let adaptiveFormats = info.player_response.streamingData.adaptiveFormats;
        for (const format of adaptiveFormats) {
          parsedFormats.push({
            itag: format.itag,
            quality: format.qualityLabel,
            bitrate: format.bitrate,
            format: format.mimeType.substring(0,format.mimeType.indexOf('/')) + ' only',
            ext: format.mimeType.substring(format.mimeType.indexOf('/')+1,format.mimeType.indexOf(';')),
          });
        }

        let titleOfVideo = info.player_response.videoDetails.title;

        // result
        return ({title: titleOfVideo, availableFormats: parsedFormats});
    } 
}

module.exports = YtDownloadController;