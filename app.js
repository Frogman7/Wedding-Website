// module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var db = require('./config/db-schema');
var auth = require('./config/passport-config');
var hbs = require('hbs');
var indexController = require('./controllers');
var adminController = require('./controllers/admin');

require('./config/hbs-helpers')(hbs);
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('the most secrety of secrets'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(lessMiddleware({ src: path.join(__dirname, 'public'), yuicompress: true }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// 404
app.use(function(req, res, next){
	res.status(404);
	res.render('error', {
		title: '404 - Charlene & Max\'s Wedding',
		error: 'We couldn\'t find the page you were looking for!'
	});
});

// routing
app.get('/', indexController.index);
app.post('/poll', indexController.pollPost);
app.get('/wedding', indexController.wedding);
app.get('/reception', indexController.reception);
app.get('/registry', indexController.registry);
app.get('/photos', indexController.photos);

app.get('/rsvp', indexController.rsvp);
app.post('/rsvp', indexController.rsvpPost);
app.get('/rsvp/linksent', indexController.rsvpLinkSent);
app.get('/rsvp/detail/:id', indexController.rsvpDetail);
app.post('/rsvp/detail/:id', indexController.rsvpDetailPost);
app.get('/rsvp/thanks/:id', indexController.rsvpThanks);

app.get('/admin', adminController.index);
app.post('/admin', adminController.indexPost);
app.get('/admin/dashboard', auth.ensureAuthenticated, adminController.dashboard);
app.get('/admin/rsvp', auth.ensureAuthenticated, adminController.rsvp);
app.get('/admin/poll', auth.ensureAuthenticated, adminController.poll);
app.get('/admin/logout', adminController.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
