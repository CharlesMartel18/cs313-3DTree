const express = require('express');
const app = express();
const url = require('url');

app.set('port', (process.env.PORT || 5000))
   .use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views')
   .set('view engine', 'ejs')
   /*.get('/getPerson', function (req, res) {
		getPerson(req, res);
	})*/
   .listen(app.get('port'), function () {
    	console.log('Node app listening on port', app.get('port'));
	});