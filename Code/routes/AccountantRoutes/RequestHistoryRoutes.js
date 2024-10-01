const express = require("express");
const router = express.Router();

//Models
const Request = require("../../Schemas/Node");
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   REQUEST HISTORY */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const requests = await Request.find({ receiver_id: req.user._id });
      res.render("accountant_pages/request_history.ejs", {
        user: req.user,
        requests: requests,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user.id }, { status: "unread" }],
        }),
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
