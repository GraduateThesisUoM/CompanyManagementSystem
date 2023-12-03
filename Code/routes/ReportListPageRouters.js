const express = require("express");
const router = express.Router();

//Models
const Report = require("../Schemas/Report");
const User = require("../Schemas/User");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   REPORT LIST PAGE */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
      res.render('admin_pages/report_list_page.ejs', {user: req.user, pending_reports: await Report.find({status: "pending"}), 
      reviewed_reports: await Report.find({status: "reviewed"}), 
      dismissed_reports: await Report.find({status: "dismissed"}),
      user_list: await User.find()})
    }
    catch (err) {
      console.error('Error loading reports page:', err);
      res.redirect('/error?origin_page=report-list-page&error=' + err);
    }
});

module.exports = router;