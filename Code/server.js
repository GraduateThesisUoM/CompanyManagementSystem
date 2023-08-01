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
const User = require("./Schemas/User");

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

/*--------    ACCOUNTANT MAIN */
app.get('/ac-main', (req, res) => {
  res.render('accountant_pages/accountant_main.ejs');
});

/*--------   WORKING */
app.get('/working', (req, res) => {
  res.render('accountant_pages/working_page.ejs');
});

/*--------   ASSIGNMENT HISTORY */
app.get('/assignment-history', (req, res) => {
  res.render('accountant_pages/assignment_history.ejs');
});

/*--------   CLIENTS */
app.get('/clients', (req, res) => {
  res.render('accountant_pages/clients_page.ejs');
});

/*--------   CLIENT PROFILE */
app.get('/client-profile', (req, res) => {
  res.render('accountant_pages/client_profile.ejs');
});

/*--------   REPORT CLIENT */
app.get('/report-client', (req, res) => {
  res.render('accountant_pages/report_client.ejs');
});

/*--------   SETTINGS */
app.get('/settings', (req, res) => {
  res.render('general/settings.ejs');
});

/*--------   PROFILE */
app.get('/profile-page', (req, res) => {
  res.render('general/profile.ejs');
});
/*--------   SING UP */
app.post('/sing-up', async (req, res) => {
  try {
    // Create a new user instance with the provided data
    if (req.body.account_type == 'user'){
      const newUser = new User({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email,
        afm: req.body.afm,
        mydatakey: req.body.mydatakey,
        companyName: req.body.companyName,
        companyLogo: req.body.companyLogo,
      });
      // Save the new user to the database
    await newUser.save();
    }
    else if (req.body.account_type == 'accountant'){
      const newUser = new User({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email,
        afm: req.body.afm,
        mydatakey: req.body.mydatakey
      });
      // Save the new user to the database
    await newUser.save();
    }
    else if (req.body.account_type == 'admin'){
      const newUser = new User({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email
      });
      // Save the new user to the database
    await newUser.save();
    }

    console.log("User created successfully");
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error saving user:', err);
    res.redirect('/sing-up?error');
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
