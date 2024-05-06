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
const User = require(path_constants.schemas.user);
const Notification = require(path_constants.schemas.notification);
const Company  = require(path_constants.schemas.company);


/*--------   CLIENTS */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try{
    if(generalFunctions.checkAccessRigts(req,req.user,res)){
      const clients_pending = await clientAccountantFunctions.fetchClients(req.user._id,"pending");
      const clients_active = await clientAccountantFunctions.fetchClients(req.user._id,"executed");
      const clients_former = await clientAccountantFunctions.fetchClients(req.user._id,"fired");
      if(clients_pending.length + clients_active.length + clients_former.length == 0){
        console.log('no clients');
      }
      
      res.render(path_constants.pages.clients.view(), { 
        user: req.user,
        clients_pending: clients_pending,
        clients_active: clients_active,
        clients_former: clients_former, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} ,{status: "unread"}]})
      });
    }
    else{
      res.redirect('/error?origin_page=/&error='+path_constants.url_param.param_1);
    }
  }
  catch(err){
    console.error(err);
      res.redirect('/error?origin_page=clients&error='+err);
  }
   
});


router.post('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    /*for (let i = 0; i < req.user.clients.length; i++) {
      if(req.user.clients[i].id.equals(req.body.clients_id)){
        req.user.clients[i].status =  req.body.accountant_action
        await req.user.save();

        const client = await User.findById(req.body.clients_id);
        create_notification(client._id, req.user._id, req.body.accountant_action+"-request-user-notification");          
        client.myaccountant.status = req.body.accountant_action
        await client.save();
        break
      }
      
    }*/
    const client = await Company.find({_id:accountantId, type:'hiring', status: select });
    console.error('Accountant ', req.body.accountant_action, ' Client Successful');
    res.redirect('/clients');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=clients&error='+err);
  }
  
});

module.exports = router;