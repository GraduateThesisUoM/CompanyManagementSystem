const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../Schemas/Accountant");
const Notification = require("../Schemas/Notification");
const Client  = require("../Schemas/Client");
const Company  = require("../Schemas/Company");
const Request = require("../Schemas/Node");



//Authentication Functions
const Authentication = require("../AuthenticationFunctions");
const create_notification = require("../CreateNotification");
const clientAccountantFunctions =require("../ClientAccountantFunctions");

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
      
      create_notification(company.companyaccountant.id, req.user._id, "firing-accountant-notification");

      clientAccountantFunctions(company._id,req.user._id, company._id);

      res.redirect("/my-accountant")
    }
    catch (err) {
      console.error('Error creating report:', err);
      res.redirect('/error?origin_page=self-accountant-register&error=' + err);
    }
});


module.exports = router;