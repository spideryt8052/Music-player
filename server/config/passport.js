const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const createPlaceholderEmail = (provider, providerId) => `${provider}-${providerId}@musicplayer.local`;

const createUserPassword = async () => {
  const randomSecret = crypto.randomBytes(32).toString('hex');
  return bcrypt.hash(randomSecret, 10);
};

const buildUsername = (displayName, provider, providerId) => {
  const baseName = (displayName || provider || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'user';

  return `${baseName}_${providerId.slice(-6)}`;
};

const upsertSocialUser = async ({ provider, providerId, email, displayName, photo }) => {
  const lookup = provider === 'google'
    ? { $or: [{ googleId: providerId }, ...(email ? [{ email }] : [])] }
    : { $or: [{ facebookId: providerId }, ...(email ? [{ email }] : [])] };

  let user = await User.findOne(lookup);

  if (!user) {
    const password = await createUserPassword();
    user = await User.create({
      username: buildUsername(displayName, provider, providerId),
      email: email || createPlaceholderEmail(provider, providerId),
      password,
      isAdmin: false,
      googleId: provider === 'google' ? providerId : undefined,
      facebookId: provider === 'facebook' ? providerId : undefined,
      profilePicture: photo,
    });
    return user;
  }

  const updates = {};

  if (provider === 'google' && !user.googleId) {
    updates.googleId = providerId;
  }

  if (provider === 'facebook' && !user.facebookId) {
    updates.facebookId = providerId;
  }

  if (photo && !user.profilePicture) {
    updates.profilePicture = photo;
  }

  if (!user.email && email) {
    updates.email = email;
  }

  if (Object.keys(updates).length > 0) {
    user = await User.findByIdAndUpdate(user._id, updates, { new: true });
  }

  return user;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  try {
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const photo = profile.photos?.[0]?.value;
          const user = await upsertSocialUser({
            provider: 'google',
            providerId: profile.id,
            email,
            displayName: profile.displayName,
            photo,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  } catch (error) {
    console.log('Google OAuth strategy disabled:', error.message);
  }
} else {
  console.log('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  try {
    passport.use(new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const photo = profile.photos?.[0]?.value;
          const user = await upsertSocialUser({
            provider: 'facebook',
            providerId: profile.id,
            email,
            displayName: profile.displayName,
            photo,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  } catch (error) {
    console.log('Facebook OAuth strategy disabled:', error.message);
  }
} else {
  console.log('Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to enable it.');
}

module.exports = passport;