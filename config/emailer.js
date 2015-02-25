var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

console.info("Account: " + process.env.ACCOUNT + " Password " + process.env.PASSWORD)

var transporter = mailer.createTransport(smtpTransport({
    transport: "SMTP",
    host: "smtp.gmail.com",
    secureConnection: true,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
        user: process.env.ACCOUNT,
        pass: process.env.PASSWORD
    }
}));

//var transporter = mailer.createTransport({
//    service: 'Gmail',
//    auth:
//    {
//        user: process.env.ACCOUNT,
//        pass: process.env.PASSWORD
//    }
//});

exports.sendRsvpLinkTo = function(emailAddress, rsvpId, next) {

    var email = {
        from: 'Max Blumenthal <' + process.env.ACCOUNT + '>',
        to: emailAddress, // list of receivers
        subject: 'RSVP link for Max and Charlene\'s wedding', // Subject line
        text: 'To get back into your RSVP, please use the following link: http://mcwedding.herokuapp.com/rsvp/detail/' + rsvpId, // plaintext body
        html: [
            '<p>Hey there,</p>',
            '',
            '<p>',
            'To get back into your RSVP, please use the following link:<br/>',
            '<a href="http://mcwedding.herokuapp.com/rsvp/detail/' + rsvpId + '">Update Your RSVP</a>',
            '</p>',
            '',
            '<p>Please let Max know if you have any trouble.</p>',
            '',
            '<p>Thanks,<br/>',
            'Max & Charlene</p>'
        ].join("\r\n")
    };

    transporter.sendMail(email, function(err) {
	
		if (err) {
			console.error(err);
			return next(err);
		};
		
		next();
	});
};

exports.sendConfirmationFor = function(rsvp, next) {

    var email = {
        from: 'Max Blumenthal <' + process.env.ACCOUNT + '>',
        to: emailAddress, // list of receivers
        subject: 'RSVP confirmation for Max and Charlene\'s wedding', // Subject line
        text: 'To get back into your RSVP, please use the following link: http://mcwedding.herokuapp.com/rsvp/detail/' + rsvpId, // plaintext body
        html: [
            '<p>Thanks for the RSVP!</p>',
            '',
            buildConfirmationContent(rsvp),
            '',
            '<p>',
            '<em>Guests in Your Party</em>',
            '<ul>',
            '<li>' + rsvp.name + '</li>',
            buildGuestList(rsvp),
            '</ul>',
            '</p>',
            '',
            '<p>',
            'To get back into your RSVP, please use the following link:<br/>',
            '<a href="http://mcwedding.herokuapp.com/rsvp/detail/' + rsvp.rsvpId + '">Update Your RSVP</a>',
            '</p>',
            '',
            '<p>Thanks,<br/>',
            'Charlene & Max</p>'
        ].join("\r\n")
    };

	transporter.sendMail(email, function(err) {
	
		if (err) {
			console.error(err);
			return next(err);
		};
		
		next();
	});
};


function buildConfirmationContent(rsvp) {

	if (rsvp.accept) {
		return '<p>You said you were coming with a party of ' + rsvp.guestCount +
		       '. See you by the river!</p>';
	} else if (rsvp.decline) {
		return '<p>You said you couldn\'t make it. We\'ll miss you! Hopefully we will get a chance to catch up sometime.</p>';
	} else {
		return '<p>It looks like we may have had a problem saving whether you\'d be able to come or not. Please try again using the link below or contact Max.</p>';
	}

}

function buildGuestList(rsvp) {

	if (rsvp.guests.length == 0) {
		return '';
	}

	return '<li>' + rsvp.guests.join("</li>\r\n<li>") + '</li>';
}