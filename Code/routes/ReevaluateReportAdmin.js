const express = require("express");
const router = express.Router();

//Models
const Report = require("../Schemas/Report");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   REEVALUATE REPORT */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      await Report.updateOne({_id: req.query.id}, {$set: {status: "pending"}});
      res.redirect('back');
    }
    catch (err) {
      console.error('Error reevaluating report:', err);
      res.redirect('/error?origin_page=reevaluate-report&error=' + err);
    }
});

module.exports = router;