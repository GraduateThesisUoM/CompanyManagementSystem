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
const crypto = require('crypto');
const connectDB = require('./db');
const getUserByEmail = require('./getUserByEmail');
const getUserById = require('./getUserById');
const sendEmail = require('./email_sender');

// Connect to MongoDB
connectDB();

// Passport Configuration
const initializePassport = require('./passport-config');
initializePassport(passport, getUserByEmail, getUserById);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//Models
const User = require("./User");
const Admin = require("./Admin");

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.firstName });
});

/*--------   LOG IN */
app.get('/log-in', checkNotAuthenticated, (req, res) => {
  res.render('log_in.ejs');
});
app.post('/log-in', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
  failureFlash: true
}));

/*--------   SING UP */
app.get('/sing-up', checkNotAuthenticated, (req, res) => {
  res.render('sing_up.ejs');
});

app.post('/sing-up', checkNotAuthenticated, async (req, res) => {
  try {
    // Create a new user instance with the provided data
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      email: req.body.email,
      afm: req.body.afm,
      mydatakey: req.body.mydatakey,
      companyName: req.body.companyName,
      companyLogo: req.body.companyLogo
    });

    // Save the new user to the database
    await newUser.save();
    console.log("User created successfully");
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error saving user:', err);
    res.redirect('/sing-up?error');
  }
});
/*--------   SING UP ADMIN*/
app.get('/sing-up-admin', checkNotAuthenticated, (req, res) => {
  res.render('sing_up_admin.ejs');
});
app.post('/sing-up-admin', checkNotAuthenticated, async (req, res) => {
  try {
    // Create a new user instance with the provided data
    const newAdmin = new Admin({
      email: req.body.email,
      password: req.body.password,
    });

    // Save the new user to the database
    await newAdmin.save();
    console.log("Admin created successfully");
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error saving Admin:', err);
    res.redirect('/sing-up-admin?error');
  }
});

/*--------   FORGOT PASSWORD */
app.get('/forgot-password', checkNotAuthenticated, (req, res) => {
  res.render('forgot_password.ejs');
});
app.post('/forgot-password', checkNotAuthenticated, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
    }

    // Generate a unique token using crypto
    const token = crypto.randomBytes(20).toString('hex');

    // Save the token and its expiration time in the user's document
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send the password reset email to the user
    await sendEmail(email, token);
    console.log("Token created successfully and email is send");
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error processing forgot password:', err);
    res.redirect('/forgot-password?error');
  }
});
/*--------   RESET PASSWORD */
app.get('/reset-password',checkNotAuthenticated, async (req, res) => {
  console.log("in1")
  const { token } = req.query;
  console.log("in2")
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });
    console.log("in3")
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    console.log("in4")
    // Render the password reset form with the token
    res.render('reset_password.ejs', { token });
  } catch (err) {
    console.error('Error processing password reset link:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/reset-password', checkNotAuthenticated,  async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update the user's password and remove the token and expiration fields
    //user.password = await bcrypt.hash(password, 10);
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log(user.password);
    console.log("Password reseted successfully");
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.delete('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/log-in');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/log-in');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
