const express = require('express');
const rimraf = require('rimraf');
const desktopScreenshot = require('desktop-screenshot');
const path = require('path');

const app = express();
const PORT = 5000;

app.get('/screenshot.jpg', (req, res) => {

    const screenshotPath = 'screenshot.jpg';

    rimraf.sync(screenshotPath);

    desktopScreenshot(screenshotPath, function(error, complete) {

        res.sendFile(path.join(__dirname, screenshotPath));
    });
});

app.listen(PORT, () => { console.log('Screenshot server running on Port ' + PORT) });
