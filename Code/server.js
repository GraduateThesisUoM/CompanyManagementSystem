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

//Routes
app.use(path_constants.pages.index.url, require(path_constants.pages.index.file));

//View Request
app.use(path_constants.pages.view_request.url, require(path_constants.pages.view_request.file));

//notification-read
app.use(path_constants.pages.notification_read.url, require(path_constants.pages.notification_read.file));

//get-data
app.use(path_constants.pages.get_data.url, require(path_constants.pages.get_data.file));

//user-profile
app.use(path_constants.pages.user_profile.url, require(path_constants.pages.user_profile.file));

//change-ban-status
app.use(path_constants.pages.change_ban_status.url, require(path_constants.pages.change_ban_status.file));

//remove-review
app.use(path_constants.pages.remove_review.url, require(path_constants.pages.remove_review.file));

app.use(path_constants.pages.review_report.url, require(path_constants.pages.review_report.file));

app.use(path_constants.pages.remove_relationship.url, require(path_constants.pages.remove_relationship.file));

app.use(path_constants.pages.dismiss_report.url, require(path_constants.pages.dismiss_report.file));

app.use(path_constants.pages.reevaluate_report.url, require(path_constants.pages.reevaluate_report.file));

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

//my_accountant_delete_request
app.use(path_constants.pages.my_accountant_delete_request.url, require(path_constants.pages.my_accountant_delete_request.file));

//pick_accountant
app.use(path_constants.pages.pick_accountant.url, require(path_constants.pages.pick_accountant.file));

//preview_accountant
app.use(path_constants.pages.preview_accountant.url, require(path_constants.pages.preview_accountant.file));

//clients
app.use(path_constants.pages.clients.url, require(path_constants.pages.clients.file));

//create
app.use(path_constants.pages.create.url, require(path_constants.pages.create.file));

//request_history
app.use(path_constants.pages.request_history.url, require(path_constants.pages.request_history.file));

//client_profile
app.use(path_constants.pages.client_profile.url, require(path_constants.pages.client_profile.file));

//report_list_page
app.use(path_constants.pages.report_list_page.url, require(path_constants.pages.report_list_page.file));

//report
app.use(path_constants.pages.report.url, require(path_constants.pages.report.file));

//settings
app.use(path_constants.pages.settings.url, require(path_constants.pages.settings.file));

//profile_page
app.use(path_constants.pages.profile_page.url, require(path_constants.pages.profile_page.file));

//forgot_password
app.use(path_constants.pages.forgot_password.url, require(path_constants.pages.forgot_password.file));

//reset_password
app.use(path_constants.pages.reset_password.url, require(path_constants.pages.reset_password.file));

//error
app.use(path_constants.pages.error.url, require(path_constants.pages.error.file));

//delete_account
app.use(path_constants.pages.delete_account.url, require(path_constants.pages.delete_account.file));

//logout
app.use(path_constants.pages.logout.url, require(path_constants.pages.logout.file));

//remove_accountant
app.use(path_constants.pages.remove_accountant.url, require(path_constants.pages.remove_accountant.file));

//self_accountant
app.use(path_constants.pages.self_accountant.url, require(path_constants.pages.self_accountant.file));

//self_accountant_register
app.use(path_constants.pages.self_accountant_register.url, require(path_constants.pages.self_accountant_register.file));

//search
app.use(path_constants.pages.search.url, require(path_constants.pages.search.file));

//filters
app.use(path_constants.pages.filters.url, require(path_constants.pages.filters.file));

//change_ban_status
app.use(path_constants.pages.change_ban_status.url, require(path_constants.pages.change_ban_status.file));

//pickclientcompany
app.use(path_constants.pages.pickclientcompany.url, require(path_constants.pages.pickclientcompany.file));

//my_company
app.use(path_constants.pages.my_company.url, require(path_constants.pages.my_company.file));

//admin-list
app.use(path_constants.pages.list.url, require(path_constants.pages.list.file));


const http = require('http').createServer(app);
const socketIO = require('socket.io')(http);

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected`);
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(process.env.PORT, () => {
  console.log('Server started on port'+ process.env.PORT);
});

