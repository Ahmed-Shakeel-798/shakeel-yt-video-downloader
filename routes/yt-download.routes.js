const express = require("express");
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
    try {
        return ytDownloadController.downloadVideo(req, res);
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
});

// downloading audio only
router.get('/downloadSingleFormat', async (req, res) => {
    try {
        return ytDownloadController.downloadSingleFormat(req, res);
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
});

module.exports = router;