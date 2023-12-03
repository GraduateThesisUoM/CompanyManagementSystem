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

const reviewReportAdmin = require("./routes/ReviewReportAdmin");
app.use("/review-report", reviewReportAdmin);

const dismissReportAdmin = require("./routes/DismissReportAdmin");
app.use("/dismiss-report", dismissReportAdmin);

const reevaluateReportAdmin = require("./routes/ReevaluateReportAdmin");
app.use("/reevaluate-report", reevaluateReportAdmin);

const logIn = require("./routes/LogInRoutes");
app.use("/log-in", logIn);

const signUp = require("./routes/SignUpRoutes");
app.use("/sign-up", signUp);

const myAccountantRoutes = require("./routes/MyAccountantRoutes");
app.use("/my-accountant", myAccountantRoutes);

const myAccountantRate = require("./routes/MyAccountantRate");
app.use("/my-accountant-rate", myAccountantRate);

const myAccountantRequests = require("./routes/MyAccountantRequests");
app.use("/my-accountant-requests", myAccountantRequests);

const myAccountantDeleteRequest = require("./routes/MyAccountantDeleteRequest");
app.use("/my-accountant-delete-request", myAccountantDeleteRequest);

const pickAccountantRoutes = require("./routes/PickAccountantRoutes");
app.use("/pick-accountant", pickAccountantRoutes);

const previewAccountantRoutes = require("./routes/AccountantPreviewRoutes");
app.use("/preview-accountant", previewAccountantRoutes);

const workingPageRoutes = require("./routes/WorkingPageRoutes");
app.use("/working", workingPageRoutes);

const clientsPageRoutes = require("./routes/ClientsPageRouters");
app.use("/clients", clientsPageRoutes);

const requestHistoryRoutes = require("./routes/RequestHistoryRoutes");
app.use("/request-history", requestHistoryRoutes);

const clientProfileRoutes = require("./routes/ClientProfileRoutes");
app.use("/client-profile", clientProfileRoutes);

const reportListPageRoutes = require("./routes/ReportListPageRouters");
app.use("/report-list-page", reportListPageRoutes);




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
