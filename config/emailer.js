var sendgrid = require('sendgrid')(
    process.env.SENDGRID_USERNAME,
    process.env.SENDGRID_PASSWORD
);
var Email = sendgrid.Email;

exports.sendTestEmailTo = function (emailAddress, next) {
    sendgrid.send({
        to: emailAddress,
        from: process.env.EMAIL,
        subject: 'Hello world!',
        text: 'Sending email with NodeJS through SendGrid.'
    }, function (err, json) {
        if (err) {
            console.error(err);
            return next(err);
        };
        next();
    });
};

exports.sendRsvpLinkTo = function (emailAddress, rsvpId, next) {
    var email = new Email({
        to: emailAddress,
        from: process.env.EMAIL,
        fromname: 'Charlene & Max',
        subject: 'RSVP link for Max and Charlene\'s wedding'
    });
    email.setHtml([
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
        ].join("\r\n"));
    
    sendgrid.send(email, function (err, json) {
        if (err) {
            console.error(err);
            return next(err);
        };
        next();
    });
};

exports.sendConfirmationFor = function (rsvp, next) {
    var email = new Email({
        to: rsvp.emailAddress,
        from: process.env.EMAIL,
        fromname: 'Charlene & Max',
        bcc: process.env.EMAIL,
        subject: "RSVP Confirmation for Charlene & Max's Wedding"
    });
    email.setHtml([
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
        ].join("\r\n"));
    
    sendgrid.send(email, function (err, json) {
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

};

function buildGuestList(rsvp) {

    if (rsvp.guests.length == 0) {
        return '';
    }

    return '<li>' + rsvp.guests.join("</li>\r\n<li>") + '</li>';
};