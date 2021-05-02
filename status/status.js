const express = require('express');
const rimraf = require('rimraf');
const getColors = require('get-image-colors');
const path = require('path');
const sharp = require('sharp');
const { screenshot } = require('../lib/helper');

const app = express();
const PORT = 5001;

app.get('/status', async (req, res) => {

	let status = {

		angel: false,
		demon: false
	};

    rimraf.sync('status.png');
	rimraf.sync('angel.png');
	rimraf.sync('demon.png');

    screenshot('status.png')
	.on('exit', async () => {

		// angel: 20 15 410 1020
		// demon: 20 15 1630 1020

		// hex colors for the pink bar: ["#b09cb3","#c4a2c4","#bc9cbc","#bc9cc4","#b494b4", "#b09cb2"]
		const orange = ["#fc9604","#f4941c","#dc9c4c","#fc9c14","#f0983c", ,"#ff980c","#e49c4c", "#fc9704","#dc9c50","#f49420", ,"#e09c54","#f49424","#ff9808", "#f4981c", "#fc9c0c", "#f09420", "#ff9c0c", "#f49820", "#e09c50"];

		// check if angels have raid

		await sharp(path.join(__dirname, 'status.png')).extract({ width: 20, height: 15, left: 410, top: 1020}).toFile(path.join(__dirname, 'angel.png'))
		.then(async (file_info) => {

			await getColors(path.join(__dirname, 'angel.png')).then(async (colors) => {

				colors = colors.map((color) => color.hex());
			
				console.log(colors);

				for(let i=0; i<colors.length; i++) {
				
					const found = orange.find((color) => { return color == colors[i]});
				
					if (found) {
							status.angel = true;
					}				
				}
			});	
		})
		.catch((err) => {

			console.log(err);
			//res.json('Error');
			return;

		});

		// check if demons have raid

		await sharp('./status.png').extract({ width: 20, height: 15, left: 1630, top: 1020}).toFile(path.join(__dirname, 'demon.png'))
		.then(async (file_info) => {

			await getColors(path.join(__dirname, 'demon.png')).then(async (colors) => {

				colors = colors.map((color) => color.hex());

				console.log(colors);
			
				for(let i=0; i<colors.length; i++) {
				
					const found = orange.find((color) => { return color == colors[i]});
				
					if (found) {
						status.demon = true;
					}				
				}
			});	
		})
		.catch((err) => {

			console.log(err);
			//res.json('Error');
			return;

		});
	});

    res.json(status);
});

app.listen(PORT, () => { console.log('Status server running on Port ' + PORT) });
