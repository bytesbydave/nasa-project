const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const api = require('./routes/api');

const app = express();

app.use(helmet());

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

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

app.get('/auth/google', (req, res) => {});
app.get('/auth/google/callback', (req, res) => {});
app.get('/auth/loggout', (req, res) => {});

app.use('/v1', api);

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secrett value is 42');
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
