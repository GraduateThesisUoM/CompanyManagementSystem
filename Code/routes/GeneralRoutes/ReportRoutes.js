const express = require("express");
const router = express.Router();
router.use(express.static('./public/css'));
const mongoose = require('mongoose');

//Models
const Report = require("../../Schemas/Report");
const Notification = require("../../Schemas/Notification");
const Company = require("../../Schemas/Company");
const User = require("../../Schemas/User");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

const path_constants = require('../../constantsPaths');


/*--------   REPORT USER */
router.get('/user', Authentication.checkAuthenticated, async (req, res) => {
    try{
      res.render('general/report_user.ejs', {user: req.user, company_users: await User.find({ company: new mongoose.Types.ObjectId(req.query.cid) }),
              notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    }
    catch (err) {
      console.error('Error loading report user page:', err);
      res.redirect('/error?origin_page=report-user&error=' + err);
    }
});
  
router.post('/user', Authentication.checkAuthenticated, async (req,res)=> {
    try{
      let report_reason = req.body.report_user_radio;
      if(req.body.report_user_radio === "Other"){
        report_reason = req.body.report_title;
      }
      var reported_id = req.body.company_users_select;
      if(reported_id == "no_selection"){ //if no user is selected to report, report company owner
        var company_owner = await User.findOne({$and:[{company: new mongoose.Types.ObjectId(req.query.cid)} , {companyOwner: 1}]});
        reported_id = company_owner._id
        console.log(reported_id);
      }
      generalFunctions.createReport(req.user._id,reported_id,report_reason,req.body.report_textarea);
      res.redirect("/");
    }
    catch (err) {
      console.error('Error creating report:', err);
      res.redirect('/error?origin_page=report-user&error=' + err);
    }
});

/*--------   REPORT ACCOUNTANT */
router.get('/accountant', Authentication.checkAuthenticated, async (req, res) => {
  try{
    res.render('general/report_user.ejs', {user: req.user, 
      notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
  }
  catch (err) {
    console.error('Error loading report user page:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});

router.post('/accountant', Authentication.checkAuthenticated, async (req,res)=> {
  try{
    let report_reason = req.body.report_user_radio;
    if(req.body.report_user_radio === "Other"){
      report_reason = req.body.report_title;
    }
    generalFunctions.createReport(req.user._id,req.query.uid,report_reason,req.body.report_textarea);
    res.redirect("/");
  }
  catch (err) {
    console.error('Error creating report:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});



/*--------   GENERAL REPORT */
router.get('/general', Authentication.checkAuthenticated, async (req, res) => {
    try{
      res.render('general/general_report.ejs', {user: req.user,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    }
    catch (err) {
      console.error('Error loading general report page:', err);
      res.redirect('/error?origin_page=general-report&error=' + err);
    }
});
  
router.post('/general', Authentication.checkAuthenticated, async (req,res)=> {
  
    try{
      generalFunctions.createReport(req.user._id,req.user._id,req.body.report_title_area,req.body.report_textarea);
      res.redirect("//localhost:3000");

    }
    catch (err) {
      console.error('Error creating general report:', err);
      res.redirect('/error?origin_page=general-report&error=' + err);
    }
});

module.exports = router;