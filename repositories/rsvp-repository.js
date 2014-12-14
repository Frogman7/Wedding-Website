var db = require('../config/db-schema');

exports.getAll = function(next) {
	
	db.Rsvp.find({}, function(err, docs) {
		if (err) handleErrorFor(err, next);
		return next(null, docs);
	});
};

exports.getByEmailAddress = function(emailAddress, next) {

	db.Rsvp.findOne({ emailAddress: emailAddress }, function(err, doc) {
		if (err) handlErrorFor(err, next);
		return next(null, doc);
	});
};

exports.getByRsvpId = function(id, next) {

	db.Rsvp.findOne({ rsvpId: id }, function(err, doc) {
		if (err) handlErrorFor(err, next);
		return next(null, doc);
	});
};

exports.getTotalCount = function(next) {

	db.Rsvp.count({}, function(err, count) {
		if (err) handleErrorFor(err, next);
		return next(null, count);
	});
};

exports.getAcceptGuestCount = function(next) {

	db.Rsvp.aggregate(
		{ $match: { accept: true } },
		{ $group: { _id: null, 
		            guestCount: { $sum: "$guestCount" }
		          }
		}, function (err, result) {
			if (err) return handleErrorFor(err, next);
			next(null, guestCountFrom(result));
		}
	);
};

exports.getDeclineGuestCount = function(next) {

	db.Rsvp.aggregate(
		{ $match: { decline: true } },
		{ $group: { _id: null, 
		            guestCount: { $sum: "$guestCount" }
		          }
		}, function (err, result) {
			if (err) return handleErrorFor(err, next);
			next(null, guestCountFrom(result));
		}
	);
};


function handleErrorFor(err, next) {

	console.log('ERROR getting rsvp data.');
	console.log(err);
	next(err);
}

function guestCountFrom(result) {

	if (result.length > 0) {
		return result[0].guestCount;
	} 
	
	return 0;
}