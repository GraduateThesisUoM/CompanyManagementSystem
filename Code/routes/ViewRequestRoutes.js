const express = require("express");
const router = express.Router();

//Models
const Client  = require("../Schemas/Client");
const Request = require("../Schemas/Request");
const Notification = require("../Schemas/Notification");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

//Create Notification Function
const create_notification = require("../CreateNotification");

//GET REQUEST
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    const request = await Request.findOne({ _id : req.query.req_id});
    if( request.status == "pending"){
      request.status = 'viewed';
      request.save();
    }
    const accountants_client = await Client.findOne({ _id : request.sender_id});
    res.render('accountant_pages/view_request.ejs',{user : req.user, request : request, accountants_client : accountants_client, 
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

//POST REQUEST
router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const request = await Request.findOne({ _id : req.body.request_id});
      request.status = req.body.action;
      request.response = req.body.response;
      request.save();

      create_notification(request.sender_id, req.user.id, "assignments-status-notification");
      res.redirect('/');
    }
    catch (err) {
      console.error('Error saving user:', err);
      res.redirect('/error?origin_page=view-request&error='+err);
    }
});

module.exports = router;