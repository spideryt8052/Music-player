const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const hasGoogleConfig = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasFacebookConfig = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

const redirectSocialLogin = (res, user) => {
	const token = generateToken(user._id);
	const redirectUrl = new URL(clientUrl);
	redirectUrl.searchParams.set('token', token);
	redirectUrl.searchParams.set('username', user.username);
	redirectUrl.searchParams.set('isAdmin', user.isAdmin ? 'true' : 'false');
	res.redirect(redirectUrl.toString());
};

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/google', (req, res, next) => {
	if (!hasGoogleConfig) {
		return res.redirect(`${clientUrl}/?auth=google-not-configured`);
	}

	return passport.authenticate('google', {
		scope: ['profile', 'email'],
		session: false,
	})(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: `${clientUrl}/?auth=failed`,
	session: false,
}), (req, res) => {
	redirectSocialLogin(res, req.user);
});

router.get('/facebook', (req, res, next) => {
	if (!hasFacebookConfig) {
		return res.redirect(`${clientUrl}/?auth=facebook-not-configured`);
	}

	return passport.authenticate('facebook', {
		scope: ['email'],
		session: false,
	})(req, res, next);
});

router.get('/facebook/callback', passport.authenticate('facebook', {
	failureRedirect: `${clientUrl}/?auth=failed`,
	session: false,
}), (req, res) => {
	redirectSocialLogin(res, req.user);
});

module.exports = router;