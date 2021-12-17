const express = require("express");
const ytdl = require('ytdl-core');
const YtDownloadController = require('../controllers/yt-download.controller');

const router = express.Router();
const ytDownloadController = new YtDownloadController();

// getting information
router.get('/getVideoInfo', async (req, res) => {
    var URL = req.query.URL;
    try {
        result = await  ytDownloadController.getVideoInfo(URL);

        res.status(200).send(result);

    } catch (error) {
        res.status(400).send({ error: error.message })
    }
});

// downloading the video
router.get('/downloadVideo', async (req, res) => {
    var URL = req.query.URL;
    var name = req.query.name.split(' ').join('_');
    var itag = Number(req.query.itag);
    var ext = req.query.ext;
    try {
        res.header('Content-Disposition', `attachment; filename="${name}.${ext}"`);

        ytdl(URL, { quality: itag }).pipe(res)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
});

// filter: format => format.itag === itag
module.exports = router;