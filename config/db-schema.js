var bcrypt = require('bcryptjs');
var uuid = require('uuid');
var mongoose = require('mongoose');
exports.mongoose = mongoose;

var SALT_WORK_FACTOR = 10;

// connectify up in here!
var uriString =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL;
	
mongoose.connect(uriString, null, function(err, res) {

	if (err) {
		console.log('ERROR connecting to: ' + uriString + '. ' + err);
	} else {
		console.log('Successfully connected to: ' + uriString);
	}
});

// schema
/////////////////////////////////////////////////////////////////////////////////

var Schema = mongoose.Schema;

// users
// -----------------------------------------------------------------------------

var userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	name:     { type: String, required: true }
});

userSchema.methods.comparePassword = function(candidatePassword, done) {

	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return done(err);
		done(null, isMatch);
	});
};

userSchema.methods.hashPassword = function(password, done) {

	bcrypt.hash(password, SALT_WORK_FACTOR, function(err, hash) {
		if (err) return done(err);
		done(null, hash);
	});
};

var UserModel = mongoose.model('User', userSchema);
exports.User = UserModel;

// poll results
// -----------------------------------------------------------------------------

var pollSchema = new Schema({
	florida:  Boolean,
	iowa:     Boolean,
	notGoing: Boolean,
	date:     { type: Date, required: true }
});

var PollModel = mongoose.model('Poll', pollSchema);
exports.Poll = PollModel;

// RSVPs
// -----------------------------------------------------------------------------

var rsvpSchema = new Schema({
	rsvpId:         { type: String, unique: true },
	emailAddress:   { type: String, required: true, unique: true },
	name:           String,
    accept:         Boolean,
    decline:        Boolean,
	guestCount:     { type: Number, required: true, min: 0 },
    guests:         [String],
    song:           String,
    announcements:  Boolean,
	note:           String,
	createDate:     { type: Date, default: Date.now },
	updateDate:     { type: Date, default: Date.now }
});

rsvpSchema.pre('save', function(next) {
	
	var rsvp = this;
	
	if (!rsvp.rsvpId) {
		rsvp.rsvpId = uuid.v4();
	}
	
	rsvp.guestCount = rsvp.guests.length + 1;
	rsvp.updateDate = new Date();
	
	return next();	
});

var RsvpModel = mongoose.model('Rsvp', rsvpSchema);
exports.Rsvp = RsvpModel;