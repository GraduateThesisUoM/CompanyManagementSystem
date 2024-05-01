const express = require("express");
const router = express.Router();

//Models
const User = require("../../Schemas/User");
const Accountant  = require("../../Schemas/Accountant");
const Review  = require("../../Schemas/Review");
const Notification = require("../../Schemas/Notification");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   PROFILE */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    if(req.user.type == 'accountant'){
      const reviews = await Review.find({reviewed_id:req.user._id, type:"client"});
      const users = await User.find({type:"user"});
      
      const reviewUserArray = reviews.map(review => {
        const matchingUser = users.find(user => user._id.toString() === review.reviewer_id.toString());
        return { review, user: matchingUser };
      });
  
      res.render('accountant_pages/profile_accountant.ejs',{user : req.user, reviews: reviewUserArray, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    };
    if(req.user.type == 'user'){ 
      res.render('user_pages/profile_user.ejs',{user : req.user, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    };
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      req.user.firstName = req.body.firstName;
      req.user.lastName = req.body.lastName;
      req.user.email = req.body.email;
      req.user.afm = req.body.afm;
      req.user.mydatakey = req.body.mydatakey;
      if(req.user.type == 'user'){
        req.user.companyName = req.body.companyName;
        req.user.companyLogo = req.body.companyLogo;
      };
      await req.user.save();
      res.redirect('/profile-page?message=updatedatacopmlete');
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=profile-page&error='+err);
    }
});

module.exports = router;