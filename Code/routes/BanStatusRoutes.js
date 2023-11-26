const express = require("express");
const router = express.Router();

//Models
const User = require("../Schemas/User");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");


/*--------  ADMIN - BAN - UN-BAN */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      //variable contains the status we want to insert
      var status_value = "active"; 
    
      //check the value of the button to see if we are banning or unbanning the user
      if(req.body.change_ban_status_button == "Ban"){
        status_value = "banned";
      }
    
      //update the status of the user
      await User.updateOne({_id: req.query.id}, [{$set:{account_status: status_value }}]);
      res.redirect('back');
    }
    catch (err) {
      console.error('Error changing ban status:', err);
      res.redirect('/error?origin_page=change-ban-status&error=' + err);
    }
});

module.exports = router;