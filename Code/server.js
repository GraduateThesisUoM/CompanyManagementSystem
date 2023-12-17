if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const connectDB = require('./db');
const getUserByEmail = require('./getUserByEmail');
const getUserById = require('./getUserById');

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

const removeRelationshipAdmin = require("./routes/RemoveRelationshipsAdmin");
app.use("/remove-relationship", removeRelationshipAdmin);

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

const reportRoutes = require("./routes/ReportRoutes");
app.use("/report", reportRoutes);

const settingsRoutes = require("./routes/SettingsRoutes");
app.use("/settings", settingsRoutes);

const profilePageRoutes = require("./routes/ProfilePageRoutes");
app.use("/profile-page", profilePageRoutes);

const forgotPasswordRoutes = require("./routes/ForgotPasswordRoutes");
app.use("/forgot-password", forgotPasswordRoutes);

const resetPasswordRoutes = require("./routes/ResetPasswordRoutes");
app.use("/reset-password", resetPasswordRoutes);

const errorPageRoutes = require("./routes/ErrorPageRoutes");
app.use("/error", errorPageRoutes);

const deleteAccountRoutes = require("./routes/DeleteAccountRoutes");
app.use("/delete-account", deleteAccountRoutes);

const logOutRouts = require("./routes/LogOutRoutes");
app.use("/logout", logOutRouts);

const RemoveAccountantRouts = require("./routes/RemoveAccountant");
app.use("/remove_accountant", RemoveAccountantRouts);

const SelfAccountandRoutes = require("./routes/SelfAccountantRoutes.js");
app.use("/self-accountant", SelfAccountandRoutes);

const SelfAccountandRegisterRoutes = require("./routes/SelfAccountantRegister");
app.use("/self-accountant-register", SelfAccountandRegisterRoutes);


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
