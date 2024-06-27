const express = require("express");
const router = express.Router();

var mongoose = require('mongoose');

//Models
const Accountant  = require("../../Schemas/Accountant");;
const Review  = require("../../Schemas/Review");
const Node = require("../../Schemas/Node");
const Company = require("../../Schemas/Company");

const Notification = require("../../Schemas/Notification");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------    ΜΥ Company */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if(generalFunctions.checkAccessRigts(req,res)){
        const data = {
            user: req.user,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
          }
          res.render('user_pages/my_company.ejs', data);

      }
      else{
        res.redirect('/error?origin_page=my-company&error=acces denid');
      }
    }
    catch (err) {
      console.error(err);
      res.redirect('/error?origin_page=my-company&error='+err);
    }
});

module.exports = router;