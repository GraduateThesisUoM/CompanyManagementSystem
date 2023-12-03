const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../Schemas/Accountant");;
const Review  = require("../Schemas/Review");
const Request = require("../Schemas/Request");
const Notification = require("../Schemas/Notification");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------    ΜΥ ACCOUNTΑΝΤ */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if (req.user.myaccountant.status == "self_accountant"){
        res.render('user_pages/self_accountant.ejs');
      }
      else if (req.user.myaccountant.status == "assigned"){
        const users_accountant = await Accountant.findOne({_id:req.user.myaccountant.id});
        const users_requests = await Request.find({ sender_id :req.user._id, receiver_id :req.user.myaccountant.id});
        var accountant_review = await Review.findOne({reviewer_id: req.user._id, reviewed_id: req.user.myaccountant.id, type:"client"});
        if (accountant_review == null){
          accountant_review = new Review({
            reviewer_id: req.user._id,
            reviewed_id: req.user.myaccountant.id,
            rating: -1,
            registrationDate: ''
          });
        }
  
        res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests,
          notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
      }
      else{
        res.redirect('pick-accountant');
      }
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error='+err);
    }
});

module.exports = router;