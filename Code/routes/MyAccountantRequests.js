const express = require("express"); 
const router = express.Router();

//Models
const Request = require("../Schemas/Request");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if(req.body.request_due_date == ""){
        const newRequest = new Request({
          sender_id: req.user._id,
          receiver_id: req.user.myaccountant.id,
          type: req.body.request_type,
          title: req.body.request_title,
          text: req.body.request_text
        });
        newRequest.save();
      }
      else{
        const newRequest = new Request({
          sender_id: req.user._id,
          receiver_id: req.user.myaccountant.id,
          type: req.body.request_type,
          title: req.body.request_title,
          text: req.body.request_text,
          due_date : req.body.request_due_date
        });
        newRequest.save();
      }
      
      console.log('Reuest created successfully');
      res.redirect('/my-accountant');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error=' + err);
    }
});

module.exports = router;