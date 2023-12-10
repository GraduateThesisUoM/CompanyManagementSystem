const express = require("express");
const router = express.Router();

const crypto = require('crypto');
const sendEmail = require('../email_sender');

//Models
const User = require("../Schemas/User");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   FORGOT PASSWORD */
router.get('/', Authentication.checkNotAuthenticated, (req, res) => {
    res.render('forgot_password.ejs');
});

router.post('/', Authentication.checkNotAuthenticated, async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email: email });
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

module.exports = router;