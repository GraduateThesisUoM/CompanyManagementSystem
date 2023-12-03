const express = require("express");
const router = express.Router();

//Models
const User = require("../Schemas/User");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   RESET PASSWORD */
router.get('/', Authentication.checkNotAuthenticated, async (req, res) => {
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

router.post('/', Authentication.checkNotAuthenticated,  async (req, res) => {
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

module.exports = router;