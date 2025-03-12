const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const path_constants = require("../../constantsPaths");

//Models
const Accountant = require(path_constants.schemas.two.accountant);
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



const multer = require("multer");

// Configure multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", Authentication.checkAuthenticated, upload.single("file"), async (req, res) => {
  try {
      console.log(req.body); // Log form fields

      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded." });
      }

      const fileContent = req.file.buffer.toString("utf8");
      const data = JSON.parse(fileContent);
      //const overwrite = req.body.overwrite === "1" ? 1 : 0; // Convert string to number

      const overwrite = 1;

      const result = await importDataToMongo('accountant', data, 1);

      if (result.success) {
          res.json({ message: result.message });
      } else {
          res.status(500).json({ error: result.error });
      }
  } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import data." });
  }
});

const importDataToMongo = async (Schema, data, overwrite) => {
  try {
      if (!Array.isArray(data)) throw new Error("Invalid data format (Expected an array)");

      for (const record of data) {
          if (!record._id) continue; // Ensure the record has a unique MongoDB _id

          const existingRecord = await Accountant.findOne({ _id: record._id });

          if (existingRecord) {
              if (overwrite === 1) {
                  await Accountant.updateOne({ _id: record._id }, record);
                  console.log(`Updated: ${record._id}`);
              } else {
                  console.log(`Skipped existing record: ${record._id}`);
              }
          } else {
              await Accountant.create({ ...record, _id: record._id }); // Keep the same _id
              console.log(`Inserted new record: ${record._id}`);
          }
      }

      return { success: true, message: "Import completed successfully." };
  } catch (error) {
      console.error("Import error:", error.message);
      return { success: false, error: error.message };
  }
};



module.exports = router;
