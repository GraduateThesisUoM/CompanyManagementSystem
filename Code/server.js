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
const path = require('path');

const config = require("./config");

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

app.use(express.static(config.folders.css));
app.use(express.static(config.folders.img));


//Routes
const indexRoute = require("./routes/GeneralRoutes/IndexRoutes.js");
app.use("/", indexRoute);

//added access check
//const viewRequestRoute = require("./routes/AccountantRoutes/ViewRequestRoutes.js");
const viewRequestRoute = require(path.join(__dirname, process.env.ACCOUNTANT_ROUTES_PATH, 'ViewRequestRoutes.js'));
app.use("/view-request", viewRequestRoute);

const readNotification = require("./routes/GeneralRoutes/ReadNotificationRoutes.js");
app.use("/notification-read", readNotification);

const searchUserAdmin = require("./routes/AdminRoutes/SearchUserAdmin.js");
app.use("/get-data", searchUserAdmin);

//added access check
const userProfileAdminRoutes = require("./routes/AdminRoutes/UserProfileAdminRoutes.js");
app.use("/user-profile", userProfileAdminRoutes);

const changeBanStatusRoutes = require("./routes/AdminRoutes/BanStatusRoutes.js");
app.use("/change-ban-status", changeBanStatusRoutes);

const removeReviewAdmin = require("./routes/AdminRoutes/RemoveReviewAdmin.js");
app.use("/remove-review", removeReviewAdmin);

const reviewReportAdmin = require("./routes/AdminRoutes/ReviewReportAdmin.js");
app.use("/review-report", reviewReportAdmin);

const removeRelationshipAdmin = require("./routes/AdminRoutes/RemoveRelationshipsAdmin.js");/*Admin Page*/
app.use("/remove-relationship", removeRelationshipAdmin);

const dismissReportAdmin = require("./routes/AdminRoutes/DismissReportAdmin.js");/*Admin Page*/
app.use("/dismiss-report", dismissReportAdmin);

const reevaluateReportAdmin = require("./routes/AdminRoutes/ReevaluateReportAdmin.js");/*Admin Page*/
app.use("/reevaluate-report", reevaluateReportAdmin);

const logIn = require("./routes/GeneralRoutes/LogInRoutes.js");
//const logIn = require(path.join(__dirname, process.env.GENERAL_ROUTES_PATH, 'LogInRoutes.js'));

app.use("/log-in", logIn);

const signUp = require("./routes/GeneralRoutes/SignUpRoutes.js");
app.use("/sign-up", signUp);

//added access check
const myAccountantRoutes = require("./routes/UserRoutes/MyAccountantRoutes.js");/*User Page*/
app.use("/my-accountant", myAccountantRoutes);

const myAccountantRate = require("./routes/UserRoutes/MyAccountantRate.js");
app.use("/my-accountant-rate", myAccountantRate);

const myAccountantRequests = require("./routes/UserRoutes/MyAccountantRequests.js");
app.use("/my-accountant-requests", myAccountantRequests);

const myAccountantDeleteRequest = require("./routes/UserRoutes/MyAccountantDeleteRequest.js");
app.use("/my-accountant-delete-request", myAccountantDeleteRequest);

const pickAccountantRoutes = require("./routes/UserRoutes/PickAccountantRoutes.js");
app.use("/pick-accountant", pickAccountantRoutes);

//added access check
const previewAccountantRoutes = require("./routes/UserRoutes/AccountantPreviewRoutes.js");
app.use("/preview-accountant", previewAccountantRoutes);

const workingPageRoutes = require("./routes/WorkingPageRoutes");
app.use("/working", workingPageRoutes);

const clientsPageRoutes = require("./routes/AdminRoutes/ClientsPageRouters.js");
app.use("/clients", clientsPageRoutes);

const requestHistoryRoutes = require("./routes/AccountantRoutes/RequestHistoryRoutes.js");
app.use("/request-history", requestHistoryRoutes);

const clientProfileRoutes = require("./routes/AdminRoutes/ClientProfileRoutes.js");
app.use("/client-profile", clientProfileRoutes);

const reportListPageRoutes = require("./routes/AdminRoutes/ReportListPageRouters.js");
app.use("/report-list-page", reportListPageRoutes);

const reportRoutes = require("./routes/GeneralRoutes/ReportRoutes.js");
app.use("/report", reportRoutes);

const settingsRoutes = require("./routes/GeneralRoutes/SettingsRoutes.js");
app.use("/settings", settingsRoutes);

const profilePageRoutes = require("./routes/GeneralRoutes/ProfilePageRoutes.js");
app.use("/profile-page", profilePageRoutes);

const forgotPasswordRoutes = require("./routes/GeneralRoutes/ForgotPasswordRoutes.js");
app.use("/forgot-password", forgotPasswordRoutes);

const resetPasswordRoutes = require("./routes/GeneralRoutes/ResetPasswordRoutes.js");
app.use("/reset-password", resetPasswordRoutes);

const errorPageRoutes = require("./routes/GeneralRoutes/ErrorPageRoutes.js");
app.use("/error", errorPageRoutes);

const deleteAccountRoutes = require("./routes/GeneralRoutes/DeleteAccountRoutes.js");
app.use("/delete-account", deleteAccountRoutes);

const logOutRouts = require("./routes/GeneralRoutes/LogOutRoutes.js");
app.use("/logout", logOutRouts);

const RemoveAccountantRouts = require("./routes/UserRoutes/RemoveAccountant.js");
app.use("/remove_accountant", RemoveAccountantRouts);

const SelfAccountandRoutes = require("./routes/UserRoutes/SelfAccountantRoutes.js");
app.use("/self-accountant", SelfAccountandRoutes);

const SelfAccountandRegisterRoutes = require("./routes/UserRoutes/SelfAccountantRegister.js");
app.use("/self-accountant-register", SelfAccountandRegisterRoutes);

const CreateRoutes = require("./routes/CreateRoutes.js");
app.use("/create", CreateRoutes);

const PickClientCompanyRotes = require("./routes/AccountantRoutes/PickClientCompanyRoutes.js");
app.use("/pickclientcompany", PickClientCompanyRotes);


app.listen(process.env.PORT, () => {
  console.log('Server started on port 3000');
});