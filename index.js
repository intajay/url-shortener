var path = require('path');
var url = require('url');
var shortid = require('shortid');
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;

var uri = process.env.MONGODB_URI;
var port = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/shorten', function(req, res) {

	var short_url = {
		'original_url': req.query.url,
		'short_url': req.headers.host + '/' + shortid.generate()
	};

	mongo.connect(uri, function(err, db) {
		if (err) {
			console.log('Unable to connect to Database');
		} else {
			var urls = db.collection('urls');

			urls.insert(short_url, function(err, data) {
				if (err) {
					console.log('Unable to insert docs');
					res.status(500).send();
				} else {
					console.log(short_url);
					res.json({
						'original_url': short_url.original_url,
						'short_url': short_url.short_url
					});
				}
			});

			db.close();
		}
	});
});

app.get('/:token', function(req, res) {
	mongo.connect(uri, function(err, db) {
		if (err) {
			console.log('Unable to connect to Database');
		} else {
			var urls = db.collection('urls');

			urls.findOne({
				short_url: req.headers.host + '/' + req.params.token
			}, {
				_id: 0,
				original_url: 1,
				short_url: 1
			}, function(err, data) {
				if (url.parse(data.original_url).protocol === null) {
					data.original_url = 'http://' + data.original_url;
				}

				res.redirect(data.original_url);
			});

			db.close();
		}
	});
});

app.listen(port, function() {
	console.log('Server listening on Port ' + port);
});