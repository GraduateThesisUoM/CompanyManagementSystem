const express = require("express");
const router = express.Router();
const path_constants = require('../../constantsPaths');


//Models
const Notification  = require(path_constants.schemas.two.notification);
const Company  = require(path_constants.schemas.two.company);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);

/*--------   Self0 ACCOUNTANT */
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
  console.log("Make Self Accountant Post");
  //Ti kanoume me ta tasks ? xanonte h rotame prota
    try{
      const company = await Company.findOne({_id:req.user.company});
      
      //create_notification(company.accountant.id, req.user._id, "firing-accountant-notification");

      clientAccountantFunctions.send_hiring_req_to_accountant(company._id,req.user._id, company._id);

      res.redirect("/my-accountant")
    }
    catch (err) {
      console.error('Error creating report:', err);
      res.redirect('/error?error=' + err);
    }
});


module.exports = router;