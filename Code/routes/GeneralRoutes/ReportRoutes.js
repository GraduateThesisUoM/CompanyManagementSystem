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
      res.render("general/report_user.ejs", {
        user: req.user,
      });
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});
  

router.post('/', Authentication.checkAuthenticated, async (req,res)=> {
  try{
    console.log("Post ReportRoutes.js")

    var obj = await Node.findOne({company:req.user.company,status:2,next:"-"})

    if(obj){//User
      /*generalFunctions.createReport(
        req.user._id,
        obj.sender_id,
        req.body.report_reason,
        req.body.report_textarea);*/
        generalFunctions.create_node({
          company : obj.company,
          sender_id: req.user._id,
          receiver_id: obj.sender_id,
          type: 7,//Report
          type2: 7+req.body.report_reason,//Report
          text : req.body.report_textarea
        })
    }
    
    res.redirect("/");
  }
  catch (err) {
    console.error('Error creating report:', err);
    res.redirect('/error?origin_page=report-user&error=' + err);
  }
});



module.exports = router;
