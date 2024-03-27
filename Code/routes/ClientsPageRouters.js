const express = require("express");
const router = express.Router();

//Models
const User = require("../Schemas/User");
const Notification = require("../Schemas/Notification");
const Company  = require("../Schemas/Company");


//Create Notification Function
const create_notification = require("../CreateNotification");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");


/*--------   CLIENTS */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    const clients_pending = [];
    const clients_active = [];
    const clients_expired = [];
    console.log('no clients');
    if (req.user.clients.length === 0) {
      console.log('no clients');
    } else {
      console.log(req.user.clients.length);
      for (const client of req.user.clients) {
        const client_company = await Company.findById(client._id);
        console.log(client);
        /*const client_company_info = {
          user: client_company,
          status: client_company.status
        };*/
        if(client_company.companyaccountant.status == "pending"){
          clients_pending.push(client_company);
        }
        else if(client_company.companyaccountant.status == "assigned"){
          clients_active.push(client_company);
        }
        else{
          clients_expired.push(client_company);
        }
      }
    }
    res.render('accountant_pages/clients_page.ejs', { user: req.user, clients_pending: clients_pending, clients_active: clients_active, clients_expired: clients_expired, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
  
  });
  router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      for (let i = 0; i < req.user.clients.length; i++) {
        if(req.user.clients[i].id.equals(req.body.clients_id)){
          req.user.clients[i].status =  req.body.accountant_action
          await req.user.save();
  
          const client = await User.findById(req.body.clients_id);
          create_notification(client._id, req.user._id, req.body.accountant_action+"-request-user-notification");          
          client.myaccountant.status = req.body.accountant_action
          await client.save();
          break
        }
      }
      console.error('Accountant ', req.body.accountant_action, ' Client Successful');
      res.redirect('/clients');
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=clients&error='+err);
    }
  
});

module.exports = router;