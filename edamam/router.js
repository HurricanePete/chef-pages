const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const config = require('../config');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', (req, res) => {
	request({
		method: 'get',
		uri: 'https://api.edamam.com/search',
		qs: {
			"q": req.body.search,
			"app_id": config.EDAMAM_APP_ID,
			"app_key": config.EDAMAM_APP_KEY
		}
	}, function(err, response, body) {
		if(response.statusCode === 200) {
			console.log(response.statusCode);
			res.status(response.statusCode).send(body);
		}
		else {
			console.log(response.statusCode);
			res.status(response.statusCode).json({error: err});
		}
	})
});

router.post('/single', (req, res) => {
	request({
		method: 'get',
		uri: 'https://api.edamam.com/search',
		qs: {
			"r": req.body.singleUrl,
			"app_id": config.EDAMAM_APP_ID,
			"app_key": config.EDAMAM_APP_KEY
		}
	}, function(err, response, body) {
		if(response.statusCode === 200) {
			console.log(response.statusCode);
			res.status(response.statusCode).send(body);
		}
		else {
			console.log(response.statusCode);
			res.status(response.statusCode).json({error: err});
		}
	})
});

module.exports = {router};