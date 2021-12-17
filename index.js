const express = require("express");

const app = express();
app.use(express.json());

const ytDownloadRoutes = require("./routes/yt-download.routes");
app.use("/ytDownload", ytDownloadRoutes);

app.listen(3000, function () {
    console.log("Server started on 3000");
});