const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require('../../constantsPaths');

//Models
const Report = require(path_constants.schemas.two.report);
const Company  = require(path_constants.schemas.two.company);


//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   REVIEW REPORT */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      await Report.updateOne({_id: req.query.id}, {$set: {status: req.query.action}});
      var report = await Report.findOne({_id: req.query.id});

      if(report.reason == 'licence'){
        var company = await Company.findOne({_id: report.reporter_id});
        if(req.query.action == 'executed'){
          company.license.bought = company.license.bought + company.license.requested;
          company.license.requested =0;

          await company.save();
        }
      }
      res.redirect('back');
    }
    catch (err) {
      console.error('Error reviewing report:', err);
      res.redirect('/error?origin_page=review-report&error=' + err);
    }
});

module.exports = router;