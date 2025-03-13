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
          var selected_schema = req.query.userType.split("_")[0];
          var exportData;
          if (!selected_schema) {
              return res.status(400).json({ error: "User type is required for export." });
          }
          if (selected_schema === 'companies') {  // Use '===' for comparison

            const selected_companies = req.query.selected_companies.split(',');
            exportData = []; // Store results as an array

            for (const companyId of selected_companies) {
              const companyData = {  
                companyId: companyId,
                data: {}  
              };
            
              for (const key in generalFunctions.schemaMap) {
                if (Object.prototype.hasOwnProperty.call(generalFunctions.schemaMap, key)) {
                  companyData.data[key] = await generalFunctions.schemaMap[key]
                    .find({ company: companyId })
                    .lean()
                    .exec();
                }
              }
            
              exportData.push(companyData); // Push each object into the array
            }
          
            //console.log(JSON.stringify(exportData, null, 2)); // Pretty-print the full export data
          }
          else{
            selected_schema = selected_schema.slice(0, -1);
            exportData = await User.find({ type: selected_schema }).lean().exec();
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
      var selected_schema = req.body.userType.split("_")[0];
      console.log(selected_schema)
      if(selected_schema == "admins"){
        selected_schema = 'users'
      }
      const schema = generalFunctions.schemaMap[selected_schema]
      
      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded." });
      }

      const fileContent = req.file.buffer.toString("utf8");
      const data = JSON.parse(fileContent);
      const overwrite = req.body.overwrite === "1" ? 1 : 0; // Convert string to number

      //const overwrite = 0;
      var result
      if(selected_schema == 'companies'){
        result = await importCompaniesData( data, overwrite);
      }
      else{
        result = await importDataToMongo(schema, data, overwrite);
      }

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

          const existingRecord = await Schema.findOne({ _id: record._id });

          if (existingRecord) {
              if (overwrite === 1) {
                  await Schema.updateOne({ _id: record._id }, record);
                  console.log(`Updated: ${record._id}`);
              } else {
                  console.log(`Skipped existing record: ${record._id}`);
              }
          } else {
              await Schema.create({ ...record, _id: record._id }); // Keep the same _id
              console.log(`Inserted new record: ${record._id}`);
          }
      }
      return { success: true, message: "Import completed successfully." };
  } catch (error) {
      console.error("Import error:", error.message);
      return { success: false, error: error.message };
  }
};


const importCompaniesData = async (data, overwrite) => {
  try {
      console.log("overwrite",overwrite)
      if (!Array.isArray(data)) throw new Error("Invalid data format (Expected an array)");
      for (const record of data) {
          //if (!record._id) continue; // Ensure the record has a unique MongoDB _id

          //const existingRecord = await Company.findOne({ _id: record._id });
          for (const key in record.data) {  
            console.log("Key:", key); 
            const items = record.data[key];
            if (!Array.isArray(items)) continue;

            for (const item of items) {
                const db_item = await generalFunctions.schemaMap[key].findOne({_id:item._id ,company : record.companyId});
                console.log(db_item);
                if(db_item){
                  if(overwrite == 1){
                    await generalFunctions.schemaMap[key].updateOne(
                      { _id: item._id, company: record.companyId },
                      { $set: item } // Αντικαθιστά τα δεδομένα
                    );
                  }
                  else{
                    console.log("Skip : "+key+" "+item._id);
                  }
                }
                else{
                  console.log("New");
                  const new_db_item = await new generalFunctions.schemaMap[key](item).save();
                  console.log(new_db_item)
                }
                console.log("--------------");
            }
            //var d = await generalFunctions.schemaMap[key].find({_id:record ,company : record.companyId})
            //console.log(d)
        
            /*for (const item of record.data[key]) {
                console.log("Item:", item);
            }*/
          }
         
          
          /*if (existingRecord) {
              if (overwrite === 1) {
                  await Schema.updateOne({ _id: record._id }, record);
                  console.log(`Updated: ${record._id}`);
              } else {
                  console.log(`Skipped existing record: ${record._id}`);
              }
          } else {
              await Schema.create({ ...record, _id: record._id }); // Keep the same _id
              console.log(`Inserted new record: ${record._id}`);
          }*/
      }

      return { success: true, message: "Import completed successfully." };
  } catch (error) {
      console.error("Import error:", error.message);
      return { success: false, error: error.message };
  }
};

module.exports = router;
