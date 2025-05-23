const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

//Models
const User = require("../../Schemas/User");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   DELETE ACCOUNT */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.render("general/delete_account.ejs", {
        user: req.user,
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    if (await bcrypt.compare(req.body.password, req.user.password)) {
      const user = await User.findOne({ _id: req.user._id });
      user.account_status = "deleted";
      await user.save();
      // Logout the user
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          // Handle the error if needed
        }

        // Redirect to the login page with a success message
        console.log("Delete account Completed successfully");
        res.redirect("/log-in?message=deletecomplete");
      });
    } else {
      res.redirect("/delete-account?error=wrong_password");
    }
  } catch (err) {
    console.error("Error deleting account:", err);
    res.redirect("/error?origin_page=delete-account&error=" + err);
  }
});

module.exports = router;
