const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const path_constants = require("../../constantsPaths");

//Models
const Review = require(path_constants.schemas.two.review);
const User = require(path_constants.schemas.two.user);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);


//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require( path_constants.generalFunctions_folder.two);

/*--------   ADMIN - USER PROFILE*/
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const data = {
        user: req.user,
        companies : await Company.find(),
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
      } 
      res.render(path_constants.pages.database.view(), data);

    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});


router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    var action = req.body.db_post_input;
    /*if(action == 'clear_db'){
      await generalFunctions.clear_db();
      return res.redirect(`/database?message=Db is Cleaned`);
    }
    else*/ if(req.body.selected_companies == 'all'){
      await generalFunctions.importExport(action);
    
      return res.redirect(`/database?message=${action} Completed`);
    }
    else{
      const selectedCompanies = req.body.selected_companies.split(';');
      for (const company of selectedCompanies) {
        if (company) { // Skip empty strings
          await generalFunctions.importExport(action, company);
        }
      }
      return res.redirect(`/database?message=${action} Completed`);
    }
  } catch (e) {
      console.error(e);
      return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
  }
});


module.exports = router;
