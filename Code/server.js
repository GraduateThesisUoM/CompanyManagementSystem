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
const Notification = require("./Schemas/Notification");
const { cache } = require('ejs');
const { isSet } = require('util/types');
const { report } = require('process');

app.use(express.static('./public/css'));
app.use(express.static('./public/imgs'));


//Routes
const indexRoute = require("./routes/IndexRoutes");
app.use("/", indexRoute);

const viewRequestRoute = require("./routes/ViewRequestRoutes");
app.use("/view-request", viewRequestRoute);

const readNotification = require("./routes/ReadNotificationRoutes");
app.use("/notification-read", readNotification);

const searchUserAdmin = require("./routes/SearchUserAdmin");
app.use("/get-data", searchUserAdmin);

const userProfileAdminRoutes = require("./routes/UserProfileAdminRoutes");
app.use("/user-profile", userProfileAdminRoutes);

const changeBanStatusRoutes = require("./routes/BanStatusRoutes");
app.use("/change-ban-status", changeBanStatusRoutes);

const removeReviewAdmin = require("./routes/RemoveReviewAdmin");
app.use("/remove-review", removeReviewAdmin);

const removeRelationshipsAdmin = require("./routes/RemoveRelationshipsAdmin");
app.use("/remove-relationship", removeRelationshipsAdmin);



/*--------   REVIEW REPORT */
app.post('/review-report', checkAuthenticated, async (req,res)=>{
  try{
    await Report.updateOne({_id: req.query.id}, {$set: {status: "reviewed"}});
    res.redirect('back');
  }
  catch (err) {
    console.error('Error reviewing report:', err);
    res.redirect('/error?origin_page=review-report&error=' + err);
  }
});


/*--------   DISMISS REPORT */
app.post('/dismiss-report', checkAuthenticated, async (req,res)=>{
  try{
    await Report.updateOne({_id: req.query.id}, {$set: {status: "dismissed"}});
    res.redirect('back');
  }
  catch (err) {
    console.error('Error dismissing report:', err);
    res.redirect('/error?origin_page=dismiss-report&error=' + err);
  }
});

/*--------   REEVALUATE REPORT */
app.post('/reevaluate-report', checkAuthenticated, async (req,res)=>{
  try{
    await Report.updateOne({_id: req.query.id}, {$set: {status: "pending"}});
    res.redirect('back');
  }
  catch (err) {
    console.error('Error reevaluating report:', err);
    res.redirect('/error?origin_page=reevaluate-report&error=' + err);
  }
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
    const saltRounds = 10; // You can adjust the number of salt rounds for security
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    // Create a new user instance with the provided data
    if (req.body.account_type == 'user'){
      const newUser = new Client({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
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
        password: hashedPassword,
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
        password: hashedPassword,
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

      res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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

    //Notification Creation for review
    var exist_check = await Notification.findOne({$and: [{user_id:req.user.myaccountant.id}, {type:"review-notification"}]});
      if(exist_check == null){
        const newNotification = new Notification({ //Notification constructor
          user_id: req.user.myaccountant.id,
          relevant_user_id: req.user._id,
          type: "review-notification",
          status: "unread"
        });
        await newNotification.save();
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
    if(req.body.request_due_date == ""){
      const newRequest = new Request({
        sender_id: req.user._id,
        receiver_id: req.user.myaccountant.id,
        type: req.body.request_type,
        title: req.body.request_title,
        text: req.body.request_text
      });
      newRequest.save();
    }
    else{
      const newRequest = new Request({
        sender_id: req.user._id,
        receiver_id: req.user.myaccountant.id,
        type: req.body.request_type,
        title: req.body.request_title,
        text: req.body.request_text,
        due_date : req.body.request_due_date
      });
      newRequest.save();
    }
    
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

    res.render('user_pages/pick_accountant.ejs', { user: req.user, accountants: accountants, ratings: ratings,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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
  res.render('user_pages/preview_accountant.ejs', { accountant: req.session.accountant, user: req.user, reviews: reviews,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}) });
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

      //Notification Creation for Requests
      var exist_check = await Notification.findOne({$and: [{user_id:req.user.myaccountant.id}, {type:"hiring-request-notification"}]});
      if(exist_check == null){
        const newNotification = new Notification({ //Notification constructor
          user_id: req.user.myaccountant.id,
          relevant_user_id: req.user._id,
          type: "hiring-request-notification",
          status: "unread"
        });
        await newNotification.save();
      }
      
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
app.get('/working', checkAuthenticated, async (req, res) => {
  res.render('accountant_pages/working_page.ejs', {user: req.user,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

/*--------   ASSIGNMENT HISTORY */
app.get('/assignment-history', checkAuthenticated, async (req, res) => {
  res.render('accountant_pages/assignment_history.ejs', {user: req.user,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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
  res.render('accountant_pages/clients_page.ejs', { user: req.user, clients_pending: clients_pending, clients_active: clients_active, clients_expired: clients_expired, 
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});

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

          //Notification Creation for review
          var exist_check = await Notification.findOne({$and: [{user_id: client._id}, {type:"hiring-request-user-notification"}]});
          if(exist_check == null){
            const newNotification = new Notification({ //Notification constructor
              user_id: client._id,
              relevant_user_id: req.user._id,
              type: "hiring-request-user-notification",
              status: "unread"
            });
            await newNotification.save();
          }

        }
        client.myaccountant.status = req.body.accountant_action
        await client.save();
        break
      }
    }
    console.error('Accountant ', req.body.accountant_action, ' Client Successful');
    res.redirect('/clients');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=clients&error='+err);
  }

});

/*--------   REQUEST HISTORY */
app.get('/request-history', checkAuthenticated, async (req, res) => {
  const requests = await Request.find({receiver_id:req.user._id});
  res.render('accountant_pages/request_history.ejs', {user: req.user, requests: requests, 
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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

  res.render('accountant_pages/client_profile.ejs', {selected_client : accountants_client ,user : req.user , review : accountant_review, clients_requests : clients_requests, 
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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

      //Notification Creation for review
      var exist_check = await Notification.findOne({$and: [{user_id:accountants_client._id}, {type:"review-notification"}]});
      if(exist_check == null){
        const newNotification = new Notification({ //Notification constructor
          user_id: accountants_client._id,
          relevant_user_id: req.user._id,
          type: "review-notification",
          status: "unread"
        });
        await newNotification.save();
      }


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

/*--------   REPORT LIST PAGE */
app.get('/report-list-page', checkAuthenticated, async (req, res) => {
  try{
    res.render('admin_pages/report_list_page.ejs', {user: req.user, pending_reports: await Report.find({status: "pending"}), 
    reviewed_reports: await Report.find({status: "reviewed"}), 
    dismissed_reports: await Report.find({status: "dismissed"}),
    user_list: await User.find()})
  }
  catch (err) {
    console.error('Error loading reports page:', err);
    res.redirect('/error?origin_page=report-list-page&error=' + err);
  }
});

/*--------   REPORT USER */
app.get('/report-user', checkAuthenticated, async (req, res) => {
  try{
    res.render('general/report_user.ejs', {user: req.user, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
  }
  catch (err) {
    console.error('Error loading report user page:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});

app.post('/report-user', checkAuthenticated, async (req,res)=> {
  try{
    let report_reason = req.body.report_user_radio;
    if(req.body.report_user_radio === "Other"){
      report_reason = req.body.report_title;
    }

    const newReport = new Report({ //report constructor
      reporter_id: req.user._id, //reporter id
      reported_id: req.query.id, //reported id
      reason: report_reason, //reason for report (taken from a radio in report page or inserted by the user)
      status: "pending", //report status (always starts as pending until admin reviews or dismisses it)
      text: req.body.report_textarea //report text-details
    });

    await newReport.save();
    res.redirect("back");
  }
  catch (err) {
    console.error('Error creating report:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});


/*--------   GENERAL REPORT */
app.get('/general-report', checkAuthenticated, async (req, res) => {
  try{
    res.render('general/general_report.ejs', {user: req.user,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
  }
  catch (err) {
    console.error('Error loading general report page:', err);
    res.redirect('/error?origin_page=general-report&error=' + err);
  }
});

app.post('/general-report', checkAuthenticated, async (req,res)=> {

  try{
    const newReport = new Report({ //report constructor
      reporter_id: req.user._id, //reporter id
      reported_id: req.user.id, //same as above
      reason: req.body.report_title_area, //reason for report
      status: "pending", //report status (always starts as pending until admin reviews or dismisses it)
      text: req.body.report_textarea //report text-details
    });

    await newReport.save();
    res.redirect("back");
  }
  catch (err) {
    console.error('Error creating general report:', err);
    res.redirect('/error?origin_page=general-report&error=' + err);
  }
});


/*--------   SETTINGS */
app.get('/settings', checkAuthenticated, async (req, res) => {
  res.render('general/settings.ejs', { user: req.user,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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

    res.render('accountant_pages/profile_accountant.ejs',{user : req.user, reviews: reviewUserArray, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
  };
  if(req.user.type == 'user'){
    const users_accountant = await Accountant.findOne({_id:req.user.myaccountant.id});

    res.render('user_pages/profile_user.ejs',{user : req.user, users_accountant : users_accountant, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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
app.get('/delete-account', checkAuthenticated, async (req, res) => {
  res.render('general/delete_account.ejs', { user: req.user,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}) });
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
app.delete('/logout', async (req, res) => {
  const user = await User.findOne({_id:req.user.id});
  user.last_log_out = new Date().toISOString();
  user.save()
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
