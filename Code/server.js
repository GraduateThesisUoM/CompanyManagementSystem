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
const Accountant  = require("./Schemas/Accountant");
const Client  = require("./Schemas/Client");
const Review  = require("./Schemas/Review");
const { cache } = require('ejs');

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', checkAuthenticated, (req, res) => {
  if(req.user.type == 'accountant'){
    res.render('accountant_pages/accountant_main.ejs',{user : req.user});
  };
  if(req.user.type == 'user'){
    res.render('user_pages/user_main.ejs',{user : req.user});
  };
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


/*--------   SIGN UP */
app.get('/sign-up', checkNotAuthenticated, (req, res) => {
  res.render('sign_up.ejs');
});
app.post('/sign-up', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // User with the same email already exists
      return res.redirect('/error?origin_page=sign-up&error=Email already in use');
    }
    // Create a new user instance with the provided data
    if (req.body.account_type == 'user'){
      const newUser = new Client({
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
      if(req.body.self_accountant == "true"){
        newUser.myaccountant.id = newUser._id
        newUser.myaccountant.status = "self_accountant"
        await newUser.save();
      }
      console.log("User created successfully");
    }
    else if (req.body.account_type == 'accountant'){
      const newAccountant = new Accountant({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email,
        afm: req.body.afm,
        mydatakey: req.body.mydatakey,
        clients:[]
      });
    // Save the new user to the database
    await newAccountant.save();
    console.log("Accountant created successfully");
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
    console.log("Admin created successfully");
    }
    res.redirect('/log-in');
  } catch (err) {
    console.error('Error saving user:', err);
    res.redirect('/error?origin_page=sign-up&error='+err);
  }
});

/*--------    ΜΥ ACCOUNTΑΝΤ */
app.get('/my-accountant', checkAuthenticated, async (req, res) => {
  try {
    if (req.user.myaccountant.status == "self_accountant"){
      res.render('user_pages/self_accountant.ejs');
    }
    else if (req.user.myaccountant.status == "assigned"){
      const users_accountant = await Accountant.findOne({_id:req.user.myaccountant.id});
      res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant});
    }
    else{
      res.redirect('pick-accountant');
    }
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=my-accountant&error='+err);
  }
});

app.post('/my-accountant-rate', checkAuthenticated, async (req, res) => {
  try {
    const newReview = new Review({
      senderID: req.user._id,
      receiverID: req.user.myaccountant.id,
      text: req.body.rating_textarea,
      rating: req.body.rating_input
    });
    await newReview.save();
    console.log("Review created successfully");
    res.redirect('/my-accountant');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=my-accountant&error='+err);
  }
});

/*--------   PICK ACCOUNTANT */
app.get('/pick-accountant', checkAuthenticated, async (req, res) => {
  try {
    const accountants = await Accountant.find({}); // Fetch all accountants from the database
    accountants.sort((a, b) => a.firstName.localeCompare(b.firstName));

    res.render('user_pages/pick_accountant.ejs', { accountants: accountants});
  } catch (err) {
    console.error('Error fetching accountants:', err);
    res.redirect('/error?origin_page=pick-accountant&error=' + err);
  }
});
app.post('/pick-accountant', checkAuthenticated, async (req, res) => {
  try {
    const accountant = await Accountant.find({_id:req.body.accountant_id});
    req.session.accountant = accountant[0];
    res.redirect('/preview-accountant');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=pick-accountant&error='+err);
  }
});

/*--------   ACCOUNTANT PREVIEW */
app.get('/preview-accountant', checkAuthenticated, async (req, res) => {
  res.render('user_pages/preview_accountant.ejs', { accountant: req.session.accountant, user: req.user });
});
app.post('/preview-accountant', checkAuthenticated, async (req, res) => {
  try {
    if(req.user.myaccountant.id!="not_assigned"){
      const last_accountant = await Accountant.findOne({_id:req.user.myaccountant.id});
      for (let i = 0; i < last_accountant.clients.length; i++){
        if( last_accountant.clients[i].id.equals(req.user._id)){
          last_accountant.clients.splice(i, 1);
          await last_accountant.save();
          break;
        }
      }
    }
    const accountant = await Accountant.findOne({_id:req.session.accountant._id});
      accountant.clients.push({id: req.user._id, status:"pending"});
      req.user.myaccountant.id = accountant._id
      req.user.myaccountant.status = "pending"
      await accountant.save();
      await req.user.save();
    res.redirect('/pick-accountant');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=pick-accountant&error='+err);
  }
});


/*--------   WORKING */
app.get('/working', checkAuthenticated, (req, res) => {
  res.render('accountant_pages/working_page.ejs');
});

/*--------   ASSIGNMENT HISTORY */
app.get('/assignment-history', checkAuthenticated, (req, res) => {
  res.render('accountant_pages/assignment_history.ejs');
});

/*--------   CLIENTS */
app.get('/clients', checkAuthenticated, async (req, res) => {
  const clients_pending = [];
  const clients_active = [];
  const clients_expired = [];
  if (req.user.clients.length === 0) {
    console.log('no clients');
  } else {
    for (const client of req.user.clients) {
      const user = await User.findById(client.id);
      const clientInfo = {
        user: user,
        status: client.status
      };
      if(client.status == "pending"){
        clients_pending.push(clientInfo);
      }
      else if(client.status == "assigned"){
        clients_active.push(clientInfo);
      }
      else{
        clients_expired.push(clientInfo);
      }
    }
  }
  res.render('accountant_pages/clients_page.ejs', { user: req.user, clients_pending: clients_pending, clients_active: clients_active, clients_expired: clients_expired });

});
app.post('/clients', checkAuthenticated, async (req, res) => {
  try {
    for (let i = 0; i < req.user.clients.length; i++) {
      if(req.user.clients[i].id.equals(req.body.clients_id)){
        req.user.clients[i].status =  req.body.accountant_action
        await req.user.save();

        const client = await User.findById(req.body.clients_id);
        client.myaccountant.status = req.user._id;
        if(req.body.accountant_action == "assigned"){
          client.myaccountant.status = "assigned";
        }
        client.myaccountant.status = req.body.accountant_action
        await client.save();
        break
      }
    }
    res.redirect('/clients');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=clients&error='+err);
  }
});

/*--------   CLIENT PROFILE */
app.get('/client-profile', checkAuthenticated, (req, res) => {
  res.render('accountant_pages/client_profile.ejs');
});

/*--------   REPORT CLIENT */
app.get('/report-client', checkAuthenticated, (req, res) => {
  res.render('accountant_pages/report_client.ejs');
});

/*--------   SETTINGS */
app.get('/settings', checkAuthenticated, (req, res) => {
  res.render('general/settings.ejs', { user: req.user });
});

/*--------   PROFILE */
app.get('/profile-page', checkAuthenticated, (req, res) => {
  res.render('general/profile.ejs', { user: req.user });
});
app.post('/profile-page', checkAuthenticated, async (req, res) => {
  try {
    req.user.firstName = req.body.firstName;
    req.user.lastName = req.body.lastName;
    req.user.email = req.body.email;
    req.user.afm = req.body.afm;
    req.user.mydatakey = req.body.mydatakey;
    req.user.companyName = req.body.companyName;
    req.user.companyLogo = req.body.companyLogo;
    await req.user.save();
    res.redirect('/profile-page?message=updatedatacopmlete');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=profile-page&error='+err);
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
    res.redirect('/error?origin_page=forgot-password&error='+err);
  }
});
/*--------   RESET PASSWORD */
app.get('/reset-password',checkNotAuthenticated, async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
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
    console.log("Password reseted successfully");
    res.redirect('/log-in');
  }
  catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
/*--------   ERROR */
app.get('/error', (req, res) => {
  res.render('general/error_page.ejs');
});
/*--------   DELETE ACCOUNT */
app.get('/delete-account', checkAuthenticated, (req, res) => {
  res.render('general/delete_account.ejs', { user: req.user });
});
app.post('/delete-account', checkAuthenticated, async (req, res) => {
  try{
    if(req.user.password == req.body.password){
      await User.deleteOne({ _id: req.user._id });
    }
    else{
      res.redirect('/delete-account?error=wrong_password');
    }
    res.redirect('/log-in?message=deletecomplete');
  }
  catch (err) {
    console.error('Error deleting account:', err);
    res.redirect('/error?origin_page=delete-account&error='+err);
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
