const jwt = require('jsonwebtoken');

function createToken(user) {
    return jwt.sign({id: user.id, email: user.email}, "My so secret sentence");
}

function signin(req, res) {

    let User = require('../models/user');

	User.findOne({email: req.body.email}, function(err, user) {
		if (err)
			throw err;

		if (user.comparePassword(req.body.password)) {
            req.session.email = req.body.email;
			req.session.logged = true;
			res.status(200).json({token: createToken(user)});
		}
		else
			res.redirect('/');
	});
}

function signup(req, res) {

    let User = require('../models/user');
	let user = new User();

    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
	user.email = req.body.email;
	user.password = req.body.password;

	user.save((err, savedUser) => {

		if (err)
			throw err;

		res.redirect('/');

	});
}

function signout(req, res) {

    req.session.email = "";
	req.session.logged = false;
    res.redirect("/");

}

function profile(req, res) {

    if (req.session.logged) {
        let User = require('../models/user');

        User.find({email : req.body.email})
        .then((user) => {
            res.status(200).json(user);
        }, (err) => {
            res.status(500).json(err);
        });
    }
        
    else
        res.redirect('/');

}

function readUsers(req, res) {

    let User = require('../models/user');

    User.findById({email : req.params.email})
    .then((user) => {
        res.status(200).json(user);
    }, (err) => {
        res.status(500).json(err);
    });
 }

module.exports.reads = readUsers;
module.exports.signin = signin;
module.exports.signup = signup;
module.exports.signout = signout;
module.exports.profile = profile;