// Buildin with nodejs
const cp = require('child_process');
const readline = require('readline');

// External modules
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const chalk = require('chalk');

// Global constants

const tracker = {
  start: Date.now(),
  audio: { downloaded: 0, total: Infinity },
  video: { downloaded: 0, total: Infinity },
};


class YtDownloadController {
    constructor() {}

    // Get info about video
    async getVideoInfo(URL) {

        // Get info about the video
        let info = await ytdl.getInfo(URL);  
        
        // Parse that information
        let parsedFormats = [];
        
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

    // Download the video
    async downloadVideo(req, res) {

      const URL = req.query.URL;
      const name = req.query.name.split(' ').join('_');
      const aItag = Number(req.query.aItag);
      const vItag = Number(req.query.vItag);
      const ext = req.query.ext;

      // Get audio and video stream going
      const audio = ytdl(URL, { filter: 'audioonly', quality: aItag})
        .on('progress', (_, downloaded, total) => {
          tracker.audio = { downloaded, total };
      });
      const video = ytdl(URL, { filter: 'videoonly', quality: vItag})
        .on('progress', (_, downloaded, total) => {
          tracker.video = { downloaded, total };
      });

      console.log(chalk.bgWhite.green(`Video Title: ${name}`));

      // Get the progress bar going
      const progressbar = setInterval(() => {
        readline.cursorTo(process.stdout, 0);
        const toMB = i => (i / 1024 / 1024).toFixed(2);

        process.stdout.write(`Audio | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
        process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

        process.stdout.write(`Video | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
        process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

        process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
        readline.moveCursor(process.stdout, 0, -2);
      }, 1000);

      // Start the ffmpeg child process
      const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '0', '-hide_banner',
        // 3 second audio offset
        '-itsoffset', '3.0', '-i', 'pipe:3',
        '-i', 'pipe:4',
        // Rescale the video
        '-vf', 'scale=320:240',
        // Choose some fancy codes
        '-c:v', 'libx265', '-x265-params', 'log-level=0',
        '-c:a', 'flac',
        // Define output container
        '-f', 'matroska', 'pipe:5',
      ], {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          'inherit', 'inherit', 'inherit',
          /* Custom: pipe:3, pipe:4, pipe:5 */
          'pipe', 'pipe', 'pipe',
        ],
      });

      ffmpegProcess.on('close', () => {
        process.stdout.write('\n\n\n');
        clearInterval(progressbar);
        console.log('done');
      });


      // Link streams
      // FFmpeg creates the transformer streams and we just have to insert / read data
      audio.pipe(ffmpegProcess.stdio[3]);
      video.pipe(ffmpegProcess.stdio[4]);

      res.header('Content-Disposition', `attachment; filename="${name}.${ext}"`);
      ffmpegProcess.stdio[5].pipe(res);
    }

    // DownloadAudioOnly
    async downloadAudio(req, res) {
      const URL = req.query.URL;
      const name = req.query.name.split(' ').join('_');
      const aItag = Number(req.query.aItag);
      const ext = req.query.ext;

      res.header('Content-Disposition', `attachment; filename="${name}.${ext}"`);
      ytdl(URL, { filter: 'audioonly', quality: aItag} ).pipe(res);
    }
}

module.exports = YtDownloadController;