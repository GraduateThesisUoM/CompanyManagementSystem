if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const connectDB = require('./db');
const getUserByEmail = require('./getUserByEmail');
const getUserById = require('./getUserById');

connectDB();

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  getUserByEmail,
  getUserById
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Models
const User = require("./User");

const uri = 'mongodb+srv://'+process.env.DB_USER_NAME+':'+process.env.DB_USER_PASSWORD+'@companymanagementsystem.setgwnn.mongodb.net/CompanyManagementSystem?retryWrites=true&w=majority';

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

/*--------   LOG IN */
app.get('/log-in', checkNotAuthenticated, (req, res) => {
  res.render('log_in.ejs')
})
app.post('/log-in', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
  failureFlash: true
}))

/*--------   SING UP */
app.get('/sing-up', checkNotAuthenticated, (req, res) => {
  res.render('sing_up.ejs');
});

app.post('/sing-up', checkNotAuthenticated, async (req, res) => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // Create a new user instance with the provided data
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      afm: req.body.afm,
      mydatakey: req.body.mydatakey,
      companyName: req.body.companyName,
      companyLogo: req.body.companyLogo
    });

    // Save the new user to the database
    await newUser.save();

    // Close the MongoDB connection when finished
    await mongoose.disconnect();

    res.redirect('/log-in');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    res.redirect('/sing-up?error');
  }
});


app.delete('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/log-in');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/log-in')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
