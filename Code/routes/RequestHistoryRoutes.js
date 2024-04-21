const express = require("express");
const router = express.Router();

//Models
const Request = require("../Schemas/Node");
const Notification = require("../Schemas/Notification");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   REQUEST HISTORY */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    const requests = await Request.find({receiver_id:req.user._id});
    res.render('accountant_pages/request_history.ejs', {user: req.user, requests: requests, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

module.exports = router;