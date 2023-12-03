const express = require("express");
const router = express.Router();

//Models
const Report = require("../Schemas/Report");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   DISMISS REPORT */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      await Report.updateOne({_id: req.query.id}, {$set: {status: "dismissed"}});
      res.redirect('back');
    }
    catch (err) {
      console.error('Error dismissing report:', err);
      res.redirect('/error?origin_page=dismiss-report&error=' + err);
    }
});

module.exports = router;