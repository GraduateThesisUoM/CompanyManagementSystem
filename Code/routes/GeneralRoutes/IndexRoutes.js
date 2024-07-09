const express = require('express');
const router = express.Router();

//File with the paths
const path_constants = require('../../constantsPaths');

//Models
const User = require(path_constants.schemas.two.user);
const Client  = require(path_constants.schemas.two.client);
const Report = require(path_constants.schemas.two.report);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Company  = require(path_constants.schemas.two.company);

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//Get clients Function
const clientAccountantFunctions = require("../../ClientAccountantFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");


router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  var data = {}
  
  if(req.user.type == 'accountant'){ // index for accountants
    //add something to get the requests that happen while away
    //add more filters
    const nodes_pending = await Node.find({receiver_id:req.user._id, status : "pending" });
    const nodes_viewed = await Node.find({receiver_id:req.user._id, status :  "viewed"});
    const nodes_rejected = await Node.find({receiver_id:req.user._id, status :  "rejected"});
    const nodes_executed = await Node.find({receiver_id:req.user._id, status : "executed"});
    const clients = await Client.find({type: 'user'});

    data = {user : req.user,
      nodes_pending : nodes_pending,
      nodes_viewed : nodes_viewed,
      nodes_rejected : nodes_rejected,
      nodes_executed : nodes_executed,
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}),
      clients : clients}

  }
  else if(req.user.type == 'user'){ //index for users
    const company = await Company.findOne({_id:req.user.company});
    data = {
      user : req.user,
      company: company,
      notification_list: await Notification.find({$and:[{user_id: req.user.id},
      {status: "unread"}]})
    }
    
  }
  else if(req.user.type == 'admin'){ // index for admins
    data = {
      user : req.user, 
      user_list: await User.find(),
      company_list: await Company.find(),
      pending_reports: await Report.find({status: "pending"})
      }
  }

  res.render(path_constants.pages.index.view(req.user.type),data);
});

module.exports = router;