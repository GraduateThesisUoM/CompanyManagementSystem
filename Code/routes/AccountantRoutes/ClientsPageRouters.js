const express = require("express");
const router = express.Router();

//Create Notification Function
const create_notification = require("../../CreateNotification");
//Get clients Function
const clientAccountantFunctions = require("../../ClientAccountantFunctions");
//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const path_constants = require('../../constantsPaths');

//Models
//const User = require("../../Schemas/User");
const User = require(path_constants.schemas.two.user);
const Notification = require(path_constants.schemas.two.notification);
const Company  = require(path_constants.schemas.two.company);


/*--------   CLIENTS */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const clients_active = await clientAccountantFunctions.fetchClients(req.user._id,"curent");
      const clients_former = await clientAccountantFunctions.fetchClients(req.user._id,"fired");
      if(clients_active.length + clients_former.length == 0){
        console.log('no clients');
      }
      
      res.render(path_constants.pages.clients.view(), { 
        user: req.user,
        clients_active: clients_active,
        clients_former: clients_former, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} ,{status: "unread"}]})
      });
    }
    else{
      res.redirect('/error?error='+access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }

   
});

module.exports = router;