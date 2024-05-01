const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../../Schemas/Accountant");
const Review  = require("../../Schemas/Review");
const Notification = require("../../Schemas/Notification");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   PICK ACCOUNTANT */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try { 
      res.render('user_pages/self_accountant.ejs', { user: req.user,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    } catch (err) {
      console.error('Error fetching accountants:', err);
      res.redirect('/error?origin_page=pick-accountant&error=' + err);
    }
});
  

module.exports = router;
  