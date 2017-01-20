var path = require('path');
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

app.listen(port, function() {
	console.log('Server listening on Port ' + port);
});