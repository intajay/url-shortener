var path = require('path');
var url = require('url');
var shortid = require('shortid');
var express = require('express');
var app = express();


var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var urlSchema = new Schema({
	originalUrl: String,
	shortUrl: String
});
var urlCollection = mongoose.model('urlCollection', urlSchema);

var uri = process.env.MONGODB_URI;
mongoose.connect(uri);
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.send('Root');
})

app.get('/shorten', function(req, res) {

	urlCollection.create({
		'originalUrl': req.query.url,
		'shortUrl': req.headers.host + '/' + shortid.generate()
	}, function(err, urls) {
		if (err) {
			res.status(500).send('Error');
		} else {
			console.log('Response :', urls);
			res.json({
				'originalUrl': urls.originalUrl,
				'shortUrl': urls.shortUrl
			});
		}
	});
});

app.get('/:token', function(req, res) {
	urlCollection.findOne({
		shortUrl: req.headers.host + '/' + req.params.token
	}).exec(function(err, urls) {
		if (err) {
			res.status(500).send('Error');
		} else {
			console.log('Redirect :', urls);

			if (urls) {
				if (url.parse(urls.originalUrl).protocol === null) {
					urls.originalUrl = 'http://' + urls.originalUrl;
				}

				res.redirect(urls.originalUrl);
			}
		}
	});
});

app.listen(port, function() {
	console.log('Server listening on Port ' + port);
});