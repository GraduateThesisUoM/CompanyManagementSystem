const express = require('express');
const router = express.Router();

//Models
const User = require("../../Schemas/User");
const Client  = require("../../Schemas/Client");
const Report = require("../../Schemas/Report");
const Request = require("../../Schemas/Node");
const Notification = require("../../Schemas/Notification");
const Company  = require("../../Schemas/Company");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//Get clients Function
const clientAccountantFunctions = require("../../ClientAccountantFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const path_constants = require('../../constantsPaths');



//GET REQUEST
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  var data = {}
  
  if(req.user.type == 'accountant'){ // index for accountants
    //add something to get the requests that happen while away

    const requests_pending = await Request.find({receiver_id:req.user._id, status : "pending" });
    const requests_viewed = await Request.find({receiver_id:req.user._id, status :  "viewed"});
    const requests_rejected = await Request.find({receiver_id:req.user._id, status :  "rejected"});
    const requests_executed = await Request.find({receiver_id:req.user._id, status : "executed"});
    const clients = await Client.find({type: 'user'});

    data = {user : req.user,
      requests_pending : requests_pending,
      requests_viewed : requests_viewed,
      requests_rejected : requests_rejected,
      requests_executed : requests_executed,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}),
      clients : clients}

    //generalFunctions.checkAccessRigts('accountant_pages/accountant_main.ejs',data,res);
    //res.render('accountant_pages/accountant_main.ejs',data);
    //res.render(path_constants.pages.index.view('accountant'),data);
  }
  else if(req.user.type == 'user'){ //index for users
    const company = await Company.findOne({_id:req.user.company});
    /*res.render('user_pages/user_main.ejs',{user : req.user, company: company,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});*/

    data = {
      user : req.user,
      company: company,
      notification_list: await Notification.find({$and:[{user_id: req.user.id},
      {status: "unread"}]})
    }
    
  }
  else if(req.user.type == 'admin'){ // index for admins

    /*res.render('admin_pages/admin_main.ejs',{user : req.user, 
    user_list: await User.find(), pending_reports: await Report.find({status: "pending"})
    });*/

    data = {
      user : req.user, 
      user_list: await User.find(),
      pending_reports: await Report.find({status: "pending"})
      }
  }

  res.render(path_constants.pages.index.view(req.user.type),data);
});

module.exports = router;