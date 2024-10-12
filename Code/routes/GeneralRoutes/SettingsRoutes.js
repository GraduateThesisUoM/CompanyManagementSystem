const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

//Models
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two);

/*--------   SETTINGS */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.render("general/settings.ejs", {
        user: req.user,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user.id }, { status: "unread" }],
        }),
      });
    }
    else{
      res.redirect('/error?error='+access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
