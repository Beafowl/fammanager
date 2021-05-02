const { screenshot } = require('../lib/helper');
const express = require('express');
const rimraf = require('rimraf');
const path = require('path');

const app = express();
const PORT = 5000;

app.get('/screenshot.jpg', (req, res) => {

    rimraf.sync('screenshot.jpg');

    screenshot('screenshot.jpg')
    .on('exit', () => { res.sendFile(path.join(__dirname, 'screenshot.jpg')) });
});

app.listen(PORT, () => { console.log('Screenshot server running on Port ' + PORT) });
