const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

const api = require('./routes/api');

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log('Google profile', profile);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true; // TODO: check if isLoggedIn, res status 401
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must be logged in',
    });
  }
  next();
}

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false,
  }),
  (req, res) => {
    console.log('Google Called us back');
  }
);
app.get('/auth/loggout', (req, res) => {});

app.use('/v1', api);

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secrett value is 42');
});

app.get('/failure', (req, res) => {
  return res.send('Failed to log in');
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
