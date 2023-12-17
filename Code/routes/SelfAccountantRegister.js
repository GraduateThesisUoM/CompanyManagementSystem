const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../Schemas/Accountant");
const Notification = require("../Schemas/Notification");
const Client  = require("../Schemas/Client");


//Authentication Functions
const Authentication = require("../AuthenticationFunctions");
const create_notification = require("../CreateNotification");


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
  
  

router.post('/', Authentication.checkAuthenticated, async (req,res)=> {
  console.log("fff");
    try{
      await Accountant.updateOne({_id: req.user.myaccountant.id}, {$pull: {clients: {id: req.user._id}}});
      create_notification(req.user.myaccountant.id, req.user._id, "firing-accountant-notification");
      await Client.updateOne({_id: req.user._id}, {$set: {"myaccountant.status": "self_accountant", "myaccountant.id": req.user._id}});

      res.redirect("/my-accountant")
    }
    catch (err) {
      console.error('Error creating report:', err);
      res.redirect('/error?origin_page=self-accountant-register&error=' + err);
    }
});


module.exports = router;