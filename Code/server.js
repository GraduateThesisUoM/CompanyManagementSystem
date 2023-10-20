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

const getAllUsers = require('./getAllUsers');

// Connect to MongoDB
connectDB();

// Passport Configuration
const initializePassport = require('./passport-config');
initializePassport(passport, getUserByEmail, getUserById);

app.set('view-engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
const Report = require("./Schemas/Report");
const Request = require("./Schemas/Request");
const { cache } = require('ejs');
const { isSet } = require('util/types');

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', checkAuthenticated, async (req, res) => {
  /*const user = await User.findOne({_id:req.user._id});
  user.last_log_in = new Date().toISOString();
  user.save()
  req.user = user;*/
  if(req.user.type == 'accountant'){
    //add something to get the requsets that hapen wile away
    const requests = await Request.find({receiver_id:req.user._id});
    const clients = await Client.find({type: 'user'});
    res.render('accountant_pages/accountant_main.ejs',{user : req.user, requests : requests, clients : clients});
  };
  if(req.user.type == 'user'){
    res.render('user_pages/user_main.ejs',{user : req.user});
  };
  if(req.user.type == 'admin'){
    res.render('admin_pages/admin_main.ejs',{user : req.user, userList : await getAllUsers()});
  };
});

/*--------   VIEW REQUEST */
app.get('/view-request', checkAuthenticated, async (req, res) => {
  const request = await Request.findOne({ _id : req.query.req_id});
  request.status = 'viewed';
  request.save();
  const accountants_client = await Client.findOne({ _id : request.sender_id});

  res.render('accountant_pages/view_request.ejs',{user : req.user, request : request, accountants_client : accountants_client});
});

app.post('/view-request', checkAuthenticated, async (req, res) => {
  try {
    const request = await Request.findOne({ _id : req.body.request_id});
    request.status = req.body.action;
    request.response = req.body.response;
    request.save();
    res.redirect('/');
  }
  catch (err) {
    console.error('Error saving user:', err);
    res.redirect('/error?origin_page=view-request&error='+err);
  }
});

/*--------   SEARCH FOR USER IN ADMIN PAGE */
/*--------   to be optimized */
app.post('/getData', async (req, res) => {
  let payload = req.body.payload.trim();
  var banflag = false;
  if(req.body.isBanned === true){
    banflag = true;
  }
  if(req.body.type === 'everyone'){
    var resultByFname = await User.find({firstName: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, banned: banflag}).exec();
    var resultByLname = await User.find({lastName: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, banned: banflag}).exec();
    var resultByEmail = await User.find({email: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, banned: banflag}).exec();
  }
  else{
    var resultByFname = await User.find({firstName: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, banned: banflag}).exec();
    var resultByLname = await User.find({lastName: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, banned: banflag}).exec();
    var resultByEmail = await User.find({email: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, banned: banflag}).exec();
  }
  
  
  var search = resultByFname.concat(resultByLname, resultByEmail); 
  
  for(var i=0;i<search.length;i++){
    for(var j=i+1;j<search.length;j++){
      if(search[i]._id.equals(search[j]._id)){
        search.splice(j, j);
        j--;
      }
    }
  }
  
  res.send({payload: search});
});

app.get('/userProfile', checkAuthenticated, async (req,res)=>{
  res.render('admin_pages/user_info_page.ejs', {user : await getUserById(req.query.id), reports: await Report.find({reported_id: req.query.id})});
});

app.post('/userProfile', checkAuthenticated, async (req,res)=>{
  await User.updateOne({_id: req.query.id}, [{$set:{banned:{$eq:[false,"$banned"]}}}]);
  res.redirect('#');
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
app.get('/sign-up', checkNotAuthenticated, (req, res) => {
  res.render('sign_up.ejs');
});
app.post('/sign-up', async (req, res) => {
  try {
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
    if (req.body.self_accountant == "true"){
      newUser.myaccountant.id = newUser._id;
      newUser.myaccountant.status = "self_accountant";
    }
    await newUser.save();
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
    res.redirect('/log-in?message=success_sign_up');
  } catch (err) {
    console.error('Error saving user:', err);
    res.redirect('/error?origin_page=sing-up&error='+err);
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
      const users_requests = await Request.find({ sender_id :req.user._id, receiver_id :req.user.myaccountant.id});
      var accountant_review = await Review.findOne({reviewer_id: req.user._id, reviewed_id: req.user.myaccountant.id, type:"client"});
      if (accountant_review == null){
        accountant_review = new Review({
          reviewer_id: req.user._id,
          reviewed_id: req.user.myaccountant.id,
          rating: -1,
          registrationDate: ''
        });
      }

      res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests});
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
    let newReview;
    const review = await Review.findOne({
      reviewer_id: req.user._id,
      reviewed_id: req.user.myaccountant.id,
      type: "client",
    });

    if (review == null) {
      newReview = new Review({
        reviewer_id: req.user._id,
        reviewed_id: req.user.myaccountant.id,
        text: req.body.rating_textarea,
        type: "client",
        rating: req.body.rating_input,
      });
    } else {
      // Update the existing review's text and rating
      review.text = req.body.rating_textarea;
      review.rating = req.body.rating_input;
      newReview = review;
    }

    await newReview.save();
    console.log('Review created or updated successfully');
    res.redirect('/my-accountant');
  } catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=my-accountant&error=' + err);
  }
});

app.post('/my-accountant-requests', checkAuthenticated, async (req, res) => {
  try {
    const newRequest = new Request({
      sender_id: req.user._id,
      receiver_id: req.user.myaccountant.id,
      type: req.body.request_type,
      title: req.body.request_title,
      text: req.body.request_text
    });

    newRequest.save()
    console.log('Reuest created successfully');
    res.redirect('/my-accountant');
  } catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=my-accountant&error=' + err);
  }
});

app.post('/my-accountant-delete-request', checkAuthenticated, async (req, res) => {
  try {
    // Find and delete the request by its ID
    const deletedRequest = await Request.findOneAndDelete({ _id: req.body.request_id });

    if (deletedRequest) {
      console.log('Request deleted successfully');
      res.redirect('/my-accountant');
    } else {
      console.log('Request not found');
      res.redirect('/my-accountant');
    }
  } catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=my-accountant&error=' + err);
  }
});


/*--------   PICK ACCOUNTANT */
app.get('/pick-accountant', checkAuthenticated, async (req, res) => {
  try {
    const accountants = await Accountant.find({}); // Fetch all accountants from the database
    accountants.sort((a, b) => a.firstName.localeCompare(b.firstName));

    const ratings = [];

    for (const accountant of accountants){
      var average_rating = 0
    
      const reviews = await Review.find({reviewed_id: accountant._id, type: "client"});

      for (const review of reviews){
        average_rating = average_rating + review.rating;
      }
      if(reviews.length > 0){
        ratings.push((average_rating / reviews.length).toFixed(1));
      }
      else{
        ratings.push("-");
      }
      
    }

    res.render('user_pages/pick_accountant.ejs', { accountants: accountants, ratings: ratings});
  } catch (err) {
    console.error('Error fetching accountants:', err);
    res.redirect('/error?origin_page=pick-accountant&error=' + err);
  }
});

app.post('/pick-accountant', checkAuthenticated, async (req, res) => {
  try {
    const accountant = await Accountant.findOne({_id:req.body.accountant_id});
    req.session.accountant = accountant;
    res.redirect('/preview-accountant');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=pick-accountant&error='+err);
  }
});

/*--------   ACCOUNTANT PREVIEW */
app.get('/preview-accountant', checkAuthenticated, async (req, res) => {
  const reviews = await Review.find({reviewed_id:req.session.accountant._id, type: "client"} )
  res.render('user_pages/preview_accountant.ejs', { accountant: req.session.accountant, user: req.user, reviews: reviews });
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
    if(req.body.user_action == "cancel_request"){
      console.log("Cancel accountant request");
      req.user.myaccountant.id = 'not_assigned'
      req.user.myaccountant.status = 'not_assigned'
    }
    else if(req.body.user_action == "sent_request"){
      console.log("Sent accountant request");
      accountant.clients.push({id: req.user._id, status: "pending"});
      await accountant.save();
      req.user.myaccountant.id = accountant._id
      req.user.myaccountant.status = "pending"
    } 
    await req.user.save();
    res.redirect('/pick-accountant?message=success_send_req_to_accountant');
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
    console.error('Accountant ', req.body.accountant_action, ' Client Succesfull');
    res.redirect('/clients');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=clients&error='+err);
  }

});

/*--------   CLIENT PROFILE */
app.get('/client-profile', checkAuthenticated, async (req, res) => {
  const accountants_client = await Client.findOne({_id:req.query.id});
  const clients_requests = await Request.find({receiver_id:req.user._id, sender_id: accountants_client._id, status: 'pending'});
  var accountant_review = await Review.findOne({reviewer_id: req.user._id, reviewed_id: accountants_client._id, type:"accountant"});
  if (accountant_review == null){
    accountant_review = new Review({
      reviewer_id: req.user._id,
      reviewed_id: accountants_client._id,
      rating: -1,
      registrationDate: ''
    });
  }

  res.render('accountant_pages/client_profile.ejs', {selected_client : accountants_client ,user : req.user , review : accountant_review, clients_requests : clients_requests});
});
app.post('/client-profile', checkAuthenticated, async (req, res) => {
  try {
    const accountants_client = await Client.findOne({_id:req.body.clients_id});
    let newReview;
    const review = await Review.findOne({
      reviewer_id: req.user._id,
      reviewed_id: accountants_client._id,
      rating: -1,
      type: "accountant",
    });

    if (review == null) {
      newReview = new Review({
        reviewer_id: req.user._id,
        reviewed_id: accountants_client._id,
        text: req.body.rating_textarea,
        type: "accountant",
        rating: req.body.rating_input,
      });
    } else {
      // Update the existing review's text and rating
      review.text = req.body.rating_textarea;
      review.rating = req.body.rating_input;
      newReview = review;
    }

    await newReview.save();
    console.log('Review created or updated successfully');
    res.redirect('/client-profile?id='+req.body.clients_id);
  } catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=client-profile&error=' + err);
  }
});

/*--------   REPORT USER */
app.get('/report-user', checkAuthenticated, (req, res) => {
  res.render('general/report_user.ejs');
});

app.post('/report-user', checkAuthenticated, async (req,res)=> {
  const newReport = new Report({
    reporter_id: req.user._id,
    reported_id: req.query.id,
    reason: req.body.report_user_radio,
    status: "pending",
    text: req.body.report_textarea
  });
  await newReport.save();
  res.redirect("/clients");
});

/*--------   REPORT DETAILS PAGE */
app.get('/report-page', checkAuthenticated, async (req, res) => {
  res.render('general/report_page.ejs', {report: await Report.find({_id: req.query.id})});
});


/*--------   SETTINGS */
app.get('/settings', checkAuthenticated, (req, res) => {
  res.render('general/settings.ejs', { user: req.user });
});

/*--------   PROFILE */
app.get('/profile-page', checkAuthenticated, async (req, res) => {
  if(req.user.type == 'accountant'){
    const reviews = await Review.find({reviewed_id:req.user._id, type:"client"});
    const users = await User.find({type:"user"});
    
    const reviewUserArray = reviews.map(review => {
      const matchingUser = users.find(user => user._id.toString() === review.reviewer_id.toString());
      return { review, user: matchingUser };
    });

    res.render('accountant_pages/profile_accountant.ejs',{user : req.user, reviews: reviewUserArray});
  };
  if(req.user.type == 'user'){
    res.render('user_pages/profile_user.ejs',{user : req.user});
  };
});
app.post('/profile-page', checkAuthenticated, async (req, res) => {
  try {
    req.user.firstName = req.body.firstName;
    req.user.lastName = req.body.lastName;
    req.user.email = req.body.email;
    req.user.afm = req.body.afm;
    req.user.mydatakey = req.body.mydatakey;
    if(req.user.type == 'user'){
      req.user.companyName = req.body.companyName;
      req.user.companyLogo = req.body.companyLogo;
    };
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
      const user = await User.findOne({ _id: req.user._id });
      user.account_status = 'deleted';
      await user.save();
      // Logout the user
      req.logout((err) => {
        if (err) {
          console.error('Error during logout:', err);
          // Handle the error if needed
        }

        // Redirect to the login page with a success message
        console.log("Delete account Completed successfully")
        res.redirect('/log-in?message=deletecomplete');
      });
    }
    else{
      res.redirect('/delete-account?error=wrong_password');
    }
  }
  catch (err) {
    console.error('Error deleting account:', err);
    res.redirect('/error?origin_page=delete-account&error='+err);
  }
});

/*--------   LOG OUT */
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
