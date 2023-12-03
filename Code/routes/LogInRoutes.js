const express = require("express");
const router = express.Router();

const passport = require('passport');

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   LOG IN */
router.get('/', Authentication.checkNotAuthenticated, (req, res) => {
    res.render('../views/log_in.ejs');
  });
  router.post('/', Authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureFlash: true
}));

module.exports = router;