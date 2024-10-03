const express = require("express");
const router = express.Router();

//Models
const Accountant = require("../../Schemas/Accountant");
const Review = require("../../Schemas/Review");
const Notification = require("../../Schemas/Notification");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   PICK ACCOUNTANT */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.render("user_pages/self_accountant.ejs", {
        user: req.user,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user.id }, { status: "unread" }],
        }),
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error fetching accountants:", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
