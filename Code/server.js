require('dotenv').config();

const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const connectDB = require('./db');
const getUserByEmail = require('./getUserByEmail');
const getUserById = require('./getUserById');

//File with the paths
const path_constants = require('./constantsPaths');

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

app.use(express.static(path_constants.folders.css));
app.use(express.static(path_constants.folders.img));
app.use(express.static(path_constants.folders.js));
app.use(express.static(path_constants.folders.svg));

//homepage
app.use(path_constants.pages.homepage.url, require(path_constants.pages.homepage.file));

//Routes
app.use(path_constants.pages.index.url, require(path_constants.pages.index.file));

//View Request
app.use(path_constants.pages.view_request.url, require(path_constants.pages.view_request.file));

//get-data
app.use(path_constants.pages.get_data.url, require(path_constants.pages.get_data.file));

//user-profile
app.use(path_constants.pages.user_profile.url, require(path_constants.pages.user_profile.file));

//change-ban-status
app.use(path_constants.pages.change_ban_status.url, require(path_constants.pages.change_ban_status.file));

//remove-review
app.use(path_constants.pages.remove_review.url, require(path_constants.pages.remove_review.file));

//log_in
app.use(path_constants.pages.log_in.url, require(path_constants.pages.log_in.file));

//sign_up
app.use(path_constants.pages.sign_up.url, require(path_constants.pages.sign_up.file));

//my_accountant
app.use(path_constants.pages.my_accountant.url, require(path_constants.pages.my_accountant.file));

//my_accountant_rate
app.use(path_constants.pages.my_accountant_rate.url, require(path_constants.pages.my_accountant_rate.file));

//my_accountant_requests
app.use(path_constants.pages.my_accountant_requests.url, require(path_constants.pages.my_accountant_requests.file));

//pick_accountant
app.use(path_constants.pages.pick_accountant.url, require(path_constants.pages.pick_accountant.file));

//preview_accountant
app.use(path_constants.pages.preview_accountant.url, require(path_constants.pages.preview_accountant.file));

//create
app.use(path_constants.pages.create.url, require(path_constants.pages.create.file));

//report
app.use(path_constants.pages.report.url, require(path_constants.pages.report.file));

//profile_page
app.use(path_constants.pages.profile_page.url, require(path_constants.pages.profile_page.file));

//forgot_password
app.use(path_constants.pages.forgot_password.url, require(path_constants.pages.forgot_password.file));

//reset_password
app.use(path_constants.pages.reset_password.url, require(path_constants.pages.reset_password.file));

//error
app.use(path_constants.pages.error.url, require(path_constants.pages.error.file));

//logout
app.use(path_constants.pages.logout.url, require(path_constants.pages.logout.file));

//self_accountant
app.use(path_constants.pages.self_accountant.url, require(path_constants.pages.self_accountant.file));

//change_ban_status
app.use(path_constants.pages.change_ban_status.url, require(path_constants.pages.change_ban_status.file));

//payroll
app.use(path_constants.pages.payroll.url, require(path_constants.pages.payroll.file));

//my_company
app.use(path_constants.pages.my_company.url, require(path_constants.pages.my_company.file));

//list
app.use(path_constants.pages.list.url, require(path_constants.pages.list.file));

//create doc
app.use(path_constants.pages.create_doc.url, require(path_constants.pages.create_doc.file));

//view
app.use(path_constants.pages.view.url, require(path_constants.pages.view.file));

//database
app.use(path_constants.pages.database.url, require(path_constants.pages.database.file));

//transform doc
app.use(path_constants.pages.transfrom_doc.url, require(path_constants.pages.transfrom_doc.file));

//transfer
app.use(path_constants.pages.transfer.url, require(path_constants.pages.transfer.file));

//edit doc
app.use(path_constants.pages.edit_doc.url, require(path_constants.pages.edit_doc.file));

//scan
app.use(path_constants.pages.scan.url, require(path_constants.pages.scan.file));

//calendar
app.use(path_constants.pages.calendar.url, require(path_constants.pages.calendar.file));

const http = require('http').createServer(app);
http.listen(process.env.PORT, () => {
  console.log('Server started on port '+ process.env.PORT);
});

