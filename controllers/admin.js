var async = require('async');
var pollRepo = require('../repositories/poll-repository');
var rsvpRepo = require('../repositories/rsvp-repository');

exports.index = function(req, res) {

	var message = req.session.message;
	req.session.message = null;

	res.render('admin', { 
		title: 'Admin Login - Charlene & Max\'s Wedding',
		layout: '',
		message: message,
		username: req.body.username
	});
};

exports.indexPost = function(req, res, next) {

	var passport = require('passport');
	passport.authenticate('local', function(err, user, info) {
	
		if (err) { return next(err); }
		
		if (!user) {
			req.session.message = [info.message];
			return exports.index(req, res);
		}
	
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/admin/dashboard');
		});
		
	})(req, res, next);
};

exports.dashboard = function(req, res) {

	async.parallel(
		{
			//pollTotalCount: pollRepo.getTotalCount,
			//pollFloridaCount: pollRepo.getFloridaCount,
			//pollIowaCount: pollRepo.getIowaCount,
			//pollNotGoingCount: pollRepo.getNotGoingCount,
			rsvpTotalCount: rsvpRepo.getTotalCount,
			rsvpAcceptGuestCount: rsvpRepo.getAcceptGuestCount,
			rsvpDeclineGuestCount: rsvpRepo.getDeclineGuestCount
		},
		function(err, data) {
		
			if (err) renderErrorFor(err, res);
		
			res.render('admin-dashboard', { 
				title: 'Admin - Charlene & Max\'s Wedding',
				layout: 'admin-layout',
				user: req.user,
				//poll: { 
				//	totalCount: data.pollTotalCount,
				//	floridaCount: data.pollFloridaCount,
				//	iowaCount: data.pollIowaCount,
				//	notGoingCount: data.pollNotGoingCount
				//},
				rsvp: {
					totalCount: data.rsvpTotalCount,
					acceptGuestCount: data.rsvpAcceptGuestCount,
					//iowaGuestCount: data.rsvpIowaGuestCount,
					declineGuestCount: data.rsvpDeclineGuestCount
				}
			});
		}
	);
};

exports.rsvp = function(req, res) {

	rsvpRepo.getAll(function(err, rsvps) {
	
		if (err) return renderErrorFor(err, res);
	
		res.render('admin-rsvp', { 
			title: 'RSVP - Admin - Charlene & Max\'s Wedding',
			layout: 'admin-layout',
			currentPage: 'rsvp',
			rsvps: rsvps
		});
	});
};

exports.poll = function(req, res) {

	pollRepo.getAll(function(err, responses) {
		
		if (err) return renderErrorFor(err, res);
		
		res.render('admin-poll', { 
			title: 'Poll - Admin - Charlene & Max\'s Wedding',
			layout: 'admin-layout',
			currentPage: 'poll',
			pollResponses: responses
		});		
	});
};

exports.logout = function(req, res) {

	req.logout();
	res.redirect('/admin');
};

function renderErrorFor(err, res) {

	res.render('error', {
		title: 'Error - Admin - Charlene & Max\'s Wedding',
		layout: 'admin-layout',
		error: err
	});
}