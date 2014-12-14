var db = require('./db-schema');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {

	if (username === 'sddaniels') {
		return done(null, getUser()); 
	}

  	done('Could not find user.');
});

passport.use(new LocalStrategy(function(username, password, done) {
	
	if (username === 'sddaniels') {
	    
	    var user = getUser();
	    user.comparePassword(password, function(err, isMatch) {
	    
	    	if (err) return done(err);
	    	
	    	if (isMatch) {
	    		return done(null, user);
	    	} else {
	    		return doneWithError(done);
	    	}
	    });
	    
	} else {
		return doneWithError(done);
	}
}));

exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {

	if (req.isAuthenticated()) { 
		return next(); 
	}

	res.redirect('/admin');
}

function getUser() {
	
	var user = new db.User({
		username: 'mcblumenthal',
		password: '$2a$10$vjxoqB0JAeyA8lNliPbZXecIXVvT0cKmE/YjZ/t3.UASFcbVOVleC',
		name:     'Max'
	});
	
	return user;
}

function doneWithError(done) {

	done(null, false, { message: 'Either the username or password you entered was incorrect.' });
}