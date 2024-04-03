const express = require("express");
const router = express.Router();

//Models
const User = require("../Schemas/User");
const Notification = require("../Schemas/Notification");
const Company  = require("../Schemas/Company");


//Create Notification Function
const create_notification = require("../CreateNotification");

//Get clients Function
const accountant_get_client_list = require("../AccountantGetClientList");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");


/*--------   CLIENTS */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try{
      const clients_pending = await accountant_get_client_list.fetchClients(req.user._id,"pending");
      const clients_active = await accountant_get_client_list.fetchClients(req.user._id,"executed");
      const clients_expired = await accountant_get_client_list.fetchClients(req.user._id,"rejected");
      if(clients_pending.length + clients_active.length + clients_expired.clients_expired == 0){
        console.log('no clients');
      }
      res.render('accountant_pages/clients_page.ejs', { user: req.user, clients_pending: clients_pending, clients_active: clients_active, clients_expired: clients_expired, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
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