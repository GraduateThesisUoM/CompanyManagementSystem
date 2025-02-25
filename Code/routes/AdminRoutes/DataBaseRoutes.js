const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const path_constants = require("../../constantsPaths");

//Models
const Review = require(path_constants.schemas.two.review);
const User = require(path_constants.schemas.two.user);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);


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
    const [schema, action] = req.body.db_post_input.split('_');

    if(schema == 'company'){
      if(req.body.selected_companies != 'all'){
        const selectedCompanies = req.body.selected_companies.split(';');
        for (const company of selectedCompanies) {
          if (company) { 
            await generalFunctions.importExport(action,schema, company);
          }
        }
      }
    }
    else{
      await generalFunctions.importExport(action,schema);
    }

    return res.redirect(`/database?message=${action} Completed`);
  } catch (e) {
      console.error(e);
      return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
  }
});


module.exports = router;
