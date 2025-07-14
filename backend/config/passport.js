const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findByGoogleId(profile.id);
    
    if (user) {
      // User exists, just return the user
      return done(null, user);
    }
    
    // Check if user exists with the same email
    user = await User.findByEmail(profile.emails[0].value);
    
    if (user) {
      // Link existing account with Google
      await User.updateGoogleInfo(user.id, {
        googleId: profile.id,
        profilePicture: profile.photos[0]?.value
      });
      user = await User.findById(user.id);
      return done(null, user);
    }
    
    // Create new user
    const userId = await User.createGoogleUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0]?.value
    });
    
    const newUser = await User.findById(userId);
    
    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;