const express = require("express");
const router = express.Router();

//Models
const Report = require("../../Schemas/Report");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   REVIEW REPORT */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      await Report.updateOne({_id: req.query.id}, {$set: {status: "reviewed"}});
      res.redirect('back');
    }
    catch (err) {
      console.error('Error reviewing report:', err);
      res.redirect('/error?origin_page=review-report&error=' + err);
    }
});

module.exports = router;