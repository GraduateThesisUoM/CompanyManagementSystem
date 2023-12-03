const express = require("express");
const router = express.Router();

//Models
const Notification = require("../Schemas/Notification");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   WORKING */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    res.render('accountant_pages/working_page.ejs', {user: req.user,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

module.exports = router;