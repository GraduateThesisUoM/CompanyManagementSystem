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
      if (!access.response) {
          return res.redirect("/error?error=" + access.error);
      }

      // Fetch necessary data
      const data = {
          user: req.user,
          companies: await Company.find(),
      };

      // Handle Export Action
      if (req.query.action === "export") {
          const userType = req.query.userType;
          var exportData;
          if (!userType) {
              return res.status(400).json({ error: "User type is required for export." });
          }
          if (req.query.userType === 'company') {  // Use '===' for comparison
            console.log('ffffffffffff')
            const selected_companies = req.query.selected_companies.split(',');
            exportData = {}; // Store results here
          
            for (const companyId of selected_companies) {
              exportData[companyId] = {  // Store results per company ID
                companyId: companyId,
                data: {}
              };
          
              for (const key in generalFunctions.schemaMap) {
                if (Object.prototype.hasOwnProperty.call(generalFunctions.schemaMap, key)) {
                  exportData[companyId].data[key] = await generalFunctions.schemaMap[key].find({ company: companyId }).lean().exec();;
                }
              }
            }
          
            //console.log(JSON.stringify(exportData, null, 2)); // Pretty-print the full export data
          }
          
          else{
            exportData = await User.find({ type: userType }).lean().exec();
          }
          
          return res.json(exportData); // Ensure JSON response
      }

      // Render Page Normally
      res.render(path_constants.pages.database.view(), data);

  } catch (err) {
      console.error("Error :", err);
      res.status(500).json({ error: "Server error occurred." }); // Ensure error returns JSON
  }
});


/*
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
});*/


module.exports = router;
