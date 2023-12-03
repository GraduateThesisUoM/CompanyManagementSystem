const express = require("express");
const router = express.Router();
router.use(express.static('./public/css'));

//Models
const Report = require("../Schemas/Report");
const Notification = require("../Schemas/Notification");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   REPORT USER */
router.get('/user', Authentication.checkAuthenticated, async (req, res) => {
    try{
      res.render('general/report_user.ejs', {user: req.user, 
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
  
      const newReport = new Report({ //report constructor
        reporter_id: req.user._id, //reporter id
        reported_id: req.query.id, //reported id
        reason: report_reason, //reason for report (taken from a radio in report page or inserted by the user)
        status: "pending", //report status (always starts as pending until admin reviews or dismisses it)
        text: req.body.report_textarea //report text-details
      });
  
      await newReport.save();
      res.redirect("back");
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
      const newReport = new Report({ //report constructor
        reporter_id: req.user._id, //reporter id
        reported_id: req.user.id, //same as above
        reason: req.body.report_title_area, //reason for report
        status: "pending", //report status (always starts as pending until admin reviews or dismisses it)
        text: req.body.report_textarea //report text-details
      });
  
      await newReport.save();
      res.redirect("back");
    }
    catch (err) {
      console.error('Error creating general report:', err);
      res.redirect('/error?origin_page=general-report&error=' + err);
    }
});

module.exports = router;