var emailer = require('../config/emailer');
var db = require('../config/db-schema');
var rsvpRepo = require('../repositories/rsvp-repository');

exports.index = function(req, res) {

	res.render('index', { 
		title: 'Charlene & Max\'s Wedding',
		pollError: req.query.error,
		pollDone: req.query.poll
	});
};

exports.pollPost = function(req, res) {
		
	var pollResponse = new db.Poll({
		drinking:  userPlansTo('drinking', req),
		fewdrinks: userPlansTo('fewdrinks', req),
		nodrinks:  userPlansTo('nodrinks', req),	
		date:     new Date()
	});
	
	pollResponse.save(function (err) { 
		if (err) {
			console.log('ERROR saving poll.');
			console.log(err);
			res.redirect('/?error=verymuchyes');
		} else {
			res.redirect('/?poll=done');
		}
	});
};

exports.wedding = function(req, res) {

	res.render('wedding', { 
		title: 'Wedding - Charlene & Max\'s Wedding',
        currentPage: 'wedding'
    });
};

exports.reception = function(req, res) {

	res.render('reception', { 
		title: 'Reception - Charlene & Max\'s Wedding',
        currentPage: 'reception'
    });
};

exports.registry = function(req, res) {

	res.render('registry', { 
		title: 'Registry - Charlene & Max\'s Wedding',
        currentPage: 'registry'
    });
};

exports.photos = function(req, res) {

	res.render('photos', { 
		title: 'Photos - Charlene & Max\'s Wedding',
        currentPage: 'photos'
    });
};

exports.rsvp = function(req, res) {

	res.render('rsvp', { 
		title: 'RSVP - Charlene & Max\'s Wedding',
        currentPage: 'rsvp'
    });
};

exports.rsvpPost = function(req, res) {

	if (!req.body.emailAddress || req.body.emailAddress.indexOf("@") == -1) {
	
		return res.render('rsvp', { 
			title: 'RSVP - Charlene & Max\'s Wedding',
			currentPage: 'rsvp',
			message: 'Please enter a valid email address!'
		});
	}
	
	// honeypot check
	if (req.body.nameField) {
		return renderErrorFor('honeypot triggered', res);
	}

	rsvpRepo.getByEmailAddress(req.body.emailAddress, function(err, rsvp) {
	
		if (err) return renderErrorFor(err, res);
	
		if (!rsvp) {
			var newRsvp = new db.Rsvp({
				emailAddress: req.body.emailAddress,
				guestCount: 0
			});
			
			newRsvp.save(function(err) {
				if (err) return renderErrorFor(err, res);
				res.redirect('/rsvp/detail/' + newRsvp.rsvpId);
			});
			
		} else {
		
			emailer.sendRsvpLinkTo(rsvp.emailAddress, rsvp.rsvpId, function(err) {
				// do nothing, treat this as fire and forget
			});
			res.redirect('/rsvp/linksent/');
		}
	});
};

exports.rsvpLinkSent = function(req, res) {
	
	res.render('rsvp-linksent', {
		title: 'RSVP Link Sent - Charlene & Max\'s Wedding',
		currentPage: 'rsvp'
	});
}

exports.rsvpDetail = function(req, res) {
	
	rsvpRepo.getByRsvpId(req.params.id, function(err, rsvp) {
	
		if (err) return renderErrorFor(err, res);
        if (!rsvp) return renderErrorFor('RSVP not found: ' + req.params.id, res);
        
        var fullSongName = rsvp.song;
        var songTitle = '';
        var songArtist = '';
        
        if (fullSongName) {
            var parts = fullSongName.split(" - ");

            if (parts.length == 1) {
                songArtist = parts[0];
            }
            else {
                songArtist = parts[0];
                songTitle = parts[1];
            }
        }
	
		res.render('rsvp-detail', {
			title: 'RSVP - Charlene & Max\'s Wedding',
			currentPage: 'rsvp',
            rsvp: rsvp,
            songtitle: songArtist,
            songartist: songTitle 
		});
	});
};

exports.rsvpDetailPost = function(req, res) {

	rsvpRepo.getByRsvpId(req.body.rsvpId, function(err, rsvp) {
	
		if (err) return renderErrorFor(err, res);
		if (!rsvp) return renderErrorFor('RSVP not found: ' + req.params.id, res);
	
		rsvp.name = req.body.rsvpName;
		rsvp.accept = userRSVPed('accept', req);
        rsvp.decline = userRSVPed('decline', req);
        
        var songTitle = req.body.rsvpSongTitle;
        
        var songArtist = req.body.rsvpSongArtist;
        
        if (songTitle) {
            if (songArtist) {
                rsvp.song = songArtist + ' - ' + songTitle;
            }
            else {
                rsvp.song = songTitle;
            }
        }

		rsvp.note = req.body.rsvpNote;
		
		rsvp.guests = [];
		for (var i in req.body.guests) {
		
			var guestName = req.body.guests[i];
			
			if (guestName && guestName.trim() != '') {
				rsvp.guests.push(guestName);
			}
		}
		
		if (!rsvp.name) {
			return renderValidationErrorFor(rsvp, 'Please enter your name.', res);
		}
		if (!rsvp.accept && !rsvp.decline) {
			return renderValidationErrorFor(rsvp, "Please let us know if you're coming!", res);
		}
        
        console.info(rsvp);
        
        console.info(rsvp.emailAddress);
		
		rsvp.save(function(err) {
		
			if (err) return renderErrorFor(err, res);
			
			emailer.sendConfirmationFor(rsvp, function(err) {
				// do nothing, treat this as fire and forget
			});
			res.redirect('/rsvp/thanks/' + rsvp.rsvpId);
		});
	});
};

exports.rsvpThanks = function(req, res) {

	rsvpRepo.getByRsvpId(req.params.id, function(err, rsvp) {
	
		if (err) return renderErrorFor(err, res);
		
		res.render('rsvp-thanks', {
			title: 'Thanks for the RSVP - Charlene & Max\'s Wedding',
			currentPage: 'rsvp',
			rsvp: rsvp
		});
	});
};


function userPlansTo(answer, req) {

	return req.body.poll === answer;
}

function userRSVPed(rsvpAnswer, req) {

	return req.body.rsvpAnswer === rsvpAnswer;
}

function renderErrorFor(err, res) {

	console.error('rendering error page');
	console.error(err);

	res.render('error', {
		title: 'Error - Charlene & Max\'s Wedding',
		error: 'There was an unexpected problem with your request.'
	});
}

function renderValidationErrorFor(rsvp, message, res) {

	return res.render('rsvp-detail', { 
		title: 'RSVP - Charlene & Max\'s Wedding',
		currentPage: 'rsvp',
		message: message,
		rsvp: rsvp
	});
}