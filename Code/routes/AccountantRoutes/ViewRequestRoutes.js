const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');
const generalFunctions = require(path_constants.generalFunctions_folder.two);
const Authentication = require(path_constants.authenticationFunctions_folder.two);


//Models
const Client  = require(path_constants.schemas.two.client);
const Node  = require(path_constants.schemas.two.node);
const Notification  = require(path_constants.schemas.two.notification);
const Company  = require(path_constants.schemas.two.company);

//GET REQUEST
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    if(generalFunctions.checkAccessRigts(req,res)){
      const node = await Node.findOne({ _id : req.query.req_id});
      if( node.status == "pending"){
        node.status = 'viewed';
        node.save();
      }
      const accountants_client = await Client.findOne({ _id : request.sender_id});
      const accountants_client_company = await Company.findOne({ _id : request.company_id});

      const data = {
        user : req.user,
        request : request,
        company:accountants_client_company,
        accountants_client : accountants_client, 
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
      }
      res.render('accountant_pages/view_request.ejs',{user : req.user, request : request, company:accountants_client_company, accountants_client : accountants_client, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    }
    else{
      res.redirect('/error?origin_page=my-accountant&error=acces denid');
    }
  }
  catch (err) {
    console.error('Error :', err);
    res.redirect('/error?origin_page=my-accountant&error='+err);
  }
});

//POST REQUEST
router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const action = req.body.action; 
      const request = await Request.findOne({ _id : req.body.request_id});
      request.status = action;
      if(request.type == 'hiring'){
        const company = await Company({ _id : request.company_id});
        company.companyaccountant.status = action;
        company.save();

      }
      else{
        request.response = req.body.response;
      }
      
      request.save();
      generalFunctions.create_notification(request.sender_id, req.user.id, "assignments-status-notification");
      res.redirect('/');
    }
    catch (err) {
      console.error('Error saving user:', err);
      res.redirect('/error?origin_page=view-request&error='+err);
    }
});

module.exports = router;