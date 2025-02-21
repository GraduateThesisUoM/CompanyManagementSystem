const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

//Models
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const User = require(path_constants.schemas.two.user);

/*--------   REPORT USER */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      //res.render("general/report_user.ejs", {
      var data = {user: req.user}
      res.render(path_constants.pages.report.view(), data);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});
  

router.post('/', Authentication.checkAuthenticated, async (req,res)=> {
  try{
    console.log("Post ReportRoutes.js")


    var report = generalFunctions.create_node({
      company : req.user.company,
      sender_id: req.user._id,
      type: 7,//Report
      type2: req.body.category,//Report
      text : req.body.report_text
    })
    
    res.redirect("/?message=report_submitted");
  }
  catch (err) {
    console.error('Error creating report:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});



module.exports = router;
