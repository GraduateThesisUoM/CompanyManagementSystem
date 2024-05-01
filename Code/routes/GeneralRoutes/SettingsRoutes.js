const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   SETTINGS */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    res.render('general/settings.ejs', { user: req.user,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

module.exports = router;