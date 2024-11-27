//File with the paths
const path_constants = require("./constantsPaths");
const fs = require("fs");
const path = require("path");
var mongoose = require("mongoose");


//Models
const Client = require(path_constants.schemas.one.client);
const Warehouse = require(path_constants.schemas.one.warehouse);
const Item = require(path_constants.schemas.one.item);
const Company = require(path_constants.schemas.one.company);
const Accountant = require(path_constants.schemas.one.accountant);
const User = require(path_constants.schemas.one.user);
const Series = require(path_constants.schemas.one.series);
const Report = require(path_constants.schemas.one.report);
const Person = require(path_constants.schemas.one.person);
const Document = require(path_constants.schemas.one.document);
const Notification = require(path_constants.schemas.one.notification);
const Node = require(path_constants.schemas.one.node);
const Review = require(path_constants.schemas.one.review);

const schemaMap = {
  users: User,
  notifications: Notification,
  companys: Company,
  clients: Client,
  reports: Report,
  series: Series,
  items: Item,
  Warehouse: Warehouse,
  persons: Person,
  accountants: Accountant,
  nodes: Node,
  reviews: Review,
  documents: Document,
};

const disabled_company_accesable_pages = ["/","/my-company"];
const company_owner_accesable_pages = ["/my-company"];

//function checkAccessRights(req, data ,res){
function checkAccessRigts(req) {
  console.log("checkAccessRigts");
  try {
    var page_url = req.baseUrl;
    if(req.baseUrl == ''){
      page_url = '/';
    }
    /*console.log(page_url)
    console.log(disabled_company_accesable_pages.includes(page_url));*/
    
    if (req.user.type == "user") {
      if (req.session.company.status != 1 && disabled_company_accesable_pages.includes(page_url) == false) {
        console.log("Access denied due to the company is closed");
        return {
          response: false,
          error: "Access denied due to the company is closed",
        };
      }
    }

    var file_path = "";
    // Iterate over each key-value pair in the pages object
    for (const [page, pageData] of Object.entries(path_constants.pages)) {
      if (pageData.url === req.originalUrl) {
        file_path = pageData.file; // Access the file path directly
        break; // Correct spelling of break
      }
    }
    var page_user_type = "general";
    if (file_path.startsWith(path_constants.routes.user)) {
      page_user_type = "user";
      if (
        req.user.companyOwner == 0 &&
        company_owner_accesable_pages.includes(req.originalUrl)
      ) {
        return { response: false, error: "Access Denied insufficient rights" };
      }
    } else if (file_path.startsWith(path_constants.routes.accountant)) {
      page_user_type = "accountant";
    } else if (file_path.startsWith(path_constants.routes.admin)) {
      page_user_type = "admin";
    } else {
      //console.log("access granted");
      return { response: true, error: "Access Granted" };
      //return true;
    }
    if (page_user_type == req.user.type) {
      //console.log("access granted");
      return { response: true, error: "Access Granted" };
      //return true;
    }
    return { response: true, error: "Access Granted" };
  } catch (e) {
    console.log(e);
    //return false;
    return { response: false, error: e };
  }
}

async function create_user(data) {
  const user = new Client({
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    email: data.email,
    afm: data.afm,
    mydatakey: data.mydatakey,
    company: data.company,
    companyOwner: data.companyOwner,
  });

  await user.save();

  console.log("User " + user.firstName + " " + user.lastName + " Created");
  return user;
}

async function create_node(data) {
  console.log('create_node')
  console.log(data)
  var status = "pending";
  var new_data = {};
  if (data.type == "relationship") {
    if(data.status != undefined){
      console.log("**************************************")
      status = data.status;
    }
    else if (data.company.equals(data.receiver_id) && data.type2 == "hiring") {
      status = "executed";
    } else if (data.type2 == "firing") {
      status = "executed";
    }
    new_data = {
      company: data.company,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      type: data.type,
      type2: data.type2,
      status: status,
      text: data.text
    };
  } else if (data.type == "request") {
    new_data = {
      company: data.company,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      type: data.type,
      type2: data.type2,
      status: status,
      text: data.text,
      title: data.title,
      due_date: data.due_date,
    };
  }
  else{
    new_data = data
  }

  const new_node = new Node(new_data);

  await new_node.save();

  return new_node;
}

async function node_reply(data) {
  console.log("node_reply")
  console.log(data)
  const target_node = await Node.findOne({ _id: data.target_node._id });
  var sts = "pending";
  var reply = data.reply;
  if(data.status != undefined){
    sts = data.status
  }
  else if (data.reply == 'firing' || data.reply == 'response') {
    sts = "executed";
  }
  if(target_node.type2 == 'hiring'){
    reply = target_node.type2;
  }

  var receiver = target_node.sender_id;
  if(receiver == data.user._id){
    receiver = target_node.receiver_id
  }

  const reply_node = await create_node({
    company: target_node.company,
    sender_id: data.user._id,
    receiver_id: receiver,
    type: target_node.type,
    type2: reply,
    text: data.text,
    status: sts,
  });

  await reply_node.save();

  target_node.next = reply_node._id;
  target_node.status = 'executed';
  await target_node.save();

  return reply_node;
}

async function create_company(data) {
  const company = new Company({
    name: data.name,
    logo: data.logo,
    signupcode: data.signupcode,
  });
  await company.save();
  console.log("company " + company.name + " Created");
  return company;
}

async function create_accountant(data) {
  const newAccountant = new Accountant({
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    email: data.email,
    afm: data.afm,
    mydatakey: data.mydatakey,
  });

  await newAccountant.save();

  console.log("Accountant " + newAccountant.firstName + " Created");

  return newAccountant;
}

async function create_admin(data) {
  const NewAdmin = new User({
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    email: data.email,
  });
  await NewAdmin.save();
  console.log("Admin " + NewAdmin.firstName + " Created");

  return NewAdmin;
}

async function createWarehouse(data) {
  console.log("creagte warehouse enter");

  try {
    const warehouse = new Warehouse({
      company: data.company,
      title: data.title,
      location: data.location
    });

    await warehouse.save();

    console.log("warehouse" + warehouse.title + " created");

    return warehouse;
  } catch (e) {
    console.log(e);
  }
}

async function createItem(data) {
  try {
    const item = new Item({
      type:data.type,
      company: data.company,
      type: data.type,
      title: data.title,
      description: data.description,
      price_r: data.price_r,
      price_w: data.price_w,
      discount_r: data.discount_r,
      discount_w: data.discount_w,
      tax_r: data.tax_r,
      tax_w: data.tax_w,
    });

    console.log("item " + item.title + " created");
    await item.save();

    return item;
  } catch (e) {
    console.log(e);
  }
}

async function createSeries(data) {
  try {
    const seies = new Series({
      company: data.company,
      title: data.title,
      acronym: data.acronym,
      type: data.type,
      sealed: data.sealed,
      effects_warehouse: data.effects_warehouse,
      credit : data.credit ,
      debit : data.debit
    });

    await seies.save();

    console.log("seies " + seies.title + " created");

    return seies;
  } catch (e) {
    console.log(e);
  }
}

async function createReport(userID, reportedID, reportReason, reportText) {
  try {
    const report = new Report({
      //report constructor
      reporter_id: userID, //reporter id
      reported_id: reportedID, //reported id
      reason: reportReason, //reason for report (taken from a radio in report page or inserted by the user)
      text: reportText, //report text-details
    });

    console.log("Report for " + reportReason + " created");
    await report.save();

    return report;
  } catch (e) {
    console.log(e);
  }
}

async function create_person(data) {
  console.log('enter create_person')
  const person = new Person({
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    afm: data.afm,
    phone: data.phone,
    company: data.company
  });

  if (data.phone2) person.phone2 = data.phone2;
  if (data.status) person.active = data.status;
  if (data.address) person.address = data.address;
  if (data.district) person.district = data.district;
  if (data.city) person.city = data.city;
  if (data.country) person.country = data.country;
  if (data.zip) person.zip = data.zip;
  if (data.shipping_address) person.shipping_address = data.shipping_address;
  if (data.shipping_district) person.shipping_district = data.shipping_district;
  if (data.shipping_city) person.shipping_city = data.shipping_city;
  if (data.shipping_country) person.shipping_country = data.shipping_country;
  if (data.shipping_zip) person.shipping_zip = data.shipping_zip;


  await person.save();

  console.log("Person " + person.f_name + " " + person.l_name + " Created");
  return person;
}

async function create_doc(data) {
  try {
    var series = await Series.findOne({ _id: data.series });
    series.count = series.count + 1;

    const newDocument = new Document({
      company: data.company,
      sender: data.sender,
      receiver: data.receiver,
      series: data.series,
      type: data.type,
      doc_num: series.count,
      retail_wholesale:data.retail_wholesale,
      warehouse : data.warehouse,
      generalDiscount: data.generalDiscount,
      invoiceData: data.invoiceData,
    });

    // Save the document to the database
    await newDocument.save();
    console.log("Document saved successfully");

    await series.save();

    return newDocument;
  } catch (error) {
    console.error("Error saving document:", error);
  }
}

async function warehose_get_inventory(data){
  var series = await Series.find({
    company:data.company,
    type: 2,
    effects_warehouse: 1,
    status : 1
  });

  var items = await Item.find({
    company : data.company,
    type: 2,
    status : 1
  })

  var item_list = []

  for(const i of items){
    item_list.push({
      id : i._id.toString(),
      title : i.title,
      count : 0})
  }


  var seriesIDs = series.map(s => s._id.toString());

  var docs = await Document.find({
    company:data.company,
    type: 2,
    series : { $in: seriesIDs },
    warehouse : data.id.toString()
  });

  var doc_items_map = {};

  // Iterate through docs and collect items and their quantities
  for (const d of docs) {
    for (const key in d.invoiceData) {
      if (d.invoiceData.hasOwnProperty(key)) {
        const doc_item = d.invoiceData[key];
        if (doc_item.lineItem) {
          // Accumulate the quantity for each lineItem
          if (!doc_items_map[doc_item.lineItem]) {
            doc_items_map[doc_item.lineItem] = 0;
          }
          doc_items_map[doc_item.lineItem] += parseFloat(doc_item.quantity);
        }
      }
    }
  }



  for (const item of item_list) {
    const doc_item_quantity = doc_items_map[item.id];
    if (doc_item_quantity) {
      item.count = doc_item_quantity;
    }
  }

  return item_list;

}

async function item_get_inventory(data){
  var series = await Series.find({
    company:data.company,
    type: 2,
    effects_warehouse: 1,
    status : 1
  });

  var items = await Item.find({_id : data.id})

  var item_list = []

  for(const i of items){
    item_list.push({
      id : i._id.toString(),
      title : i.title,
      count : 0})
  }


  var seriesIDs = series.map(s => s._id.toString());

  var docs = await Document.find({
    company:data.company,
    type: 2,
    series : { $in: seriesIDs },
  });

  var doc_items_map = {};

  // Iterate through docs and collect items and their quantities
  for (const d of docs) {
    for (const key in d.invoiceData) {
      if (d.invoiceData.hasOwnProperty(key)) {
        const doc_item = d.invoiceData[key];
        if (doc_item.lineItem) {
          // Accumulate the quantity for each lineItem
          if (!doc_items_map[doc_item.lineItem]) {
            doc_items_map[doc_item.lineItem] = 0;
          }
          doc_items_map[doc_item.lineItem] += parseFloat(doc_item.quantity);
        }
      }
    }
  }



  for (const item of item_list) {
    const doc_item_quantity = doc_items_map[item.id];
    if (doc_item_quantity) {
      item.count = doc_item_quantity;
    }
  }

  return item_list[0].count;

}

async function drop_collection(collection_name) {
  try {
    const Collection = mongoose.model(collection_name);
    await Collection.collection.drop();
    console.log("Collection " + collection_name + " deleted successfully.");
  } catch (error) {
    console.error("Error deleting collection " + collection_name + ":", error);
  }
}

async function delete_deactivate(data, schema, action) {
  try {
    console.log("delete_deactivate")
    var obj = await get_obj_by_id(data, schema);
    if (action == "delete" || action == 2) {
      obj.status = 2;
    } else if (action == "activate"|| action == 1) {
      obj.status = 1;
    } else {
      obj.status = 0;
    }
    await obj.save();
  } catch (e) {
    console.log(e);
  }
}

async function get_obj_by_id(data, schema) {
  const Model = schemaMap[schema];
  if (!Model) {
    throw new Error(`Schema ${schema} not found`);
  }
  return await Model.findOne(data);
}

async function update(id, schema , data){
  try {
    console.log('update');

    var obj = await get_obj_by_id(id, schema);
    var fieldsToUpdate;
    const lines_of_doc = {};

    if (schema == 'documents') {
      obj.generalDiscount = data.generalDiscount; 
      obj.invoiceData = data.invoiceData;
    }
    else if(schema == 'nodes') {
      obj.text = data.text; 
    }
    else{
      if (schema == 'series') {
        fieldsToUpdate = ['title', 'acronym', 'type','count', 'sealed','effects_warehouse','credit','debit', 'active'];
      }
      fieldsToUpdate.forEach((field, index) => {
        obj[field] = data["input"+index];  // Using index for data
      });
    }
    await obj.save();
  } catch (e) {
    console.log(e);
  }
}

async function create_notification(
  userID,
  relevantUserID,
  company,
  relevantCompanyID,
  notificationType
) {
  // check if a notification of the same type exists for user
  var exist_check = await Notification.findOne({
    $and: [
      { user_id: userID },
      { type: notificationType },
      { company: relevantCompanyID },
      { status: "unread" },
    ],
  });
  var stus = "unread";
  if (company == relevantCompanyID) {
    stus = "read";
  }

  // if not
  if (exist_check == null) {
    const newNotification = new Notification({
      //Notification constructor
      user_id: userID,
      relevant_user_id: relevantUserID,
      company: company,
      relevant_company_id: relevantCompanyID,
      type: notificationType,
      status: stus,
    });
    await newNotification.save();
  }
}

function get_status(id){
  if(id==0){
    return 'Disabled'
  }
  else if(id == 1){
    return 'Active'
  }
  else if(id == 2){
    return 'Deleted'
  }
  else if(id == 3){
    return 'Banned'
  }
  return 'ERROR IN GENERAL FUNCTION get_status 420'
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

async function importExport(action, company, schemas) {
  try {
    if (!['export', 'import'].includes(action)) {
      throw new Error("Invalid action. Please specify 'export' or 'import'.");
    }

    if (action === 'export') {
      await exportData(company, schemas);
      exportAdmins();
      exportAccountant();
    } else if (action === 'import') {
      await clear_db();
      await importData(company, schemas);
      importAdmins();
      importAccountants();
    }
  } catch (error) {
    console.error("Error in master function:", error);
  }
}

async function exportData(company = null, schemas) {
  try {
    const baseDir = "./exports";

    // Create the base exports directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
      console.log(`Created exports directory: ${baseDir}`);
    }

    // If schemas is null, get all schemas from schemaMap
    if (!schemas) {
      schemas = Object.keys(schemaMap);
      console.log("Schemas not provided. Exporting all schemas:", schemas);
    }

    let companies;

    if (company != null) {
      // Find a specific company by its ID
      companies = await Company.find({ _id:new mongoose.Types.ObjectId(company) });
      if (companies.length === 0) {
        console.warn(`No company found with ID: ${company}`);
        return;
      }
    } else {
      // Find all companies
      companies = await Company.find({});
      if (companies.length === 0) {
        console.warn("No companies found.");
        return;
      }
    }

    for (const company of companies) {
      // Create a folder for each company using `_id-name` format
      const companyDir = path.join(baseDir, `${company._id}-${company.name}`);
      if (!fs.existsSync(companyDir)) {
        fs.mkdirSync(companyDir);
        console.log(`Created directory for company '${company.name}': ${companyDir}`);
      }

      // Export data for each specified schema
      for (const schema of schemas) {
        const model = schemaMap[schema];
        if (!model) {
          console.warn(`Schema '${schema}' not found.`);
          continue;
        }

        const filePath = path.join(companyDir, `${schema}.txt`);
        var data
        if (model.modelName === "Company") { 
           data = await model.find({ _id: company._id }).exec(); // Filter by company ID
        }
        else if (model.modelName === "Client") { 
          data = await model.find({ __t:'client',company: company._id ,type:'user'}).exec(); // Filter by company ID
        }
        else if (schema == "accountants") { 
          continue;
        }
        else if (schema == "users") { 
          continue;
        }
        else{
          data = await model.find({ company: company._id }).exec(); // Filter by company ID
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`Exported data for company '${company.name}' in collection '${schema}' to ${filePath}`);
      }
    }
  } catch (err) {
    console.error("Error exporting data:", err);
  }
}

async function importData() {
  try {
    const baseDir = "./exports";

    // Check if the base exports directory exists
    if (!fs.existsSync(baseDir)) {
      console.error(`Exports directory not found: ${baseDir}`);
      return;
    }

    // Get all company subdirectories
    const companyDirs = fs
      .readdirSync(baseDir)
      .filter((dir) => fs.statSync(path.join(baseDir, dir)).isDirectory());

    if (companyDirs.length === 0) {
      console.warn("No company directories found in exports.");
      return;
    }
    companyDirs.pop(1);
    companyDirs.pop(2);

    for (const companyDirName of companyDirs) {
      // Extract company ID and name from directory name
      const [companyId, ...companyNameParts] = companyDirName.split("-");
      const companyName = companyNameParts.join("-");
      const companyDir = path.join(baseDir, companyDirName);

      console.log(`Processing company: ID=${companyId}, Name=${companyName}`);

      // Create or verify the company in the database
      const company = await Company.findOneAndUpdate(
        { _id: companyId },
        { _id: companyId, name: companyName },
        { upsert: true, new: true }
      );

      // Get all schema files in the company's directory
      const schemaFiles = fs
        .readdirSync(companyDir)
        .filter((file) => file.endsWith(".txt"));

      if (schemaFiles.length === 0) {
        console.warn(`No schema files found for company '${companyName}'.`);
        continue;
      }

      for (const schemaFile of schemaFiles) {
        const schemaName = path.basename(schemaFile, ".txt");
        const filePath = path.join(companyDir, schemaFile);

        const model = schemaMap[schemaName];
        if (!model) {
          console.warn(`Schema '${schemaName}' not found in schemaMap.`);
          continue;
        }
        if(model.modelName === "Company"){
          continue;
        }

        console.log(`Importing data for schema: ${schemaName} from ${filePath}`);

        // Read and parse the file data
        const fileData = fs.readFileSync(filePath, "utf-8");
        const records = JSON.parse(fileData);

        if (records.length === 0) {
          console.warn(`No records found in file for schema '${schemaName}'.`);
          continue;
        }

        // Add company ID to the records (if not Company schema)
        const enrichedRecords =
          model.modelName === "Company"
            ? records
            : records.map((record) => ({
                ...record,
                company: companyId,
              }));

        // Insert data into the database
        await model.insertMany(enrichedRecords, { ordered: false }).catch((err) => {
          console.error(`Error importing schema '${schemaName}': ${err.message}`);
        });

        console.log(`Successfully imported data for schema '${schemaName}'.`);
      }
    }

    console.log("Data import completed.");
  } catch (err) {
    console.error("Error importing data:", err);
  }
}

async function exportAdmins() {
  try {
    const baseDir = "./exports";

    // Create the base exports directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
      console.log(`Created exports directory: ${baseDir}`);
    }

    // Create the 'admins' folder inside the exports directory
    const adminsDir = path.join(baseDir, 'admins');
    if (!fs.existsSync(adminsDir)) {
      fs.mkdirSync(adminsDir);
      console.log(`Created 'admins' directory: ${adminsDir}`);
    }

    // Fetch all admin data from the Admin model

    const adminData = await User.find({type:'admin'}).exec();

    // Export admin data to a file inside the 'admins' folder
    const adminFilePath = path.join(adminsDir, 'admins.txt');
    fs.writeFileSync(adminFilePath, JSON.stringify(adminData, null, 2), 'utf-8');
    console.log(`Exported all admin data to ${adminFilePath}`);

  } catch (err) {
    console.error("Error exporting admin data:", err);
  }
}


async function exportAccountant() {
  try {
    const baseDir = "./exports";

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
      console.log(`Created exports directory: ${baseDir}`);
    }

    const accountantsDir = path.join(baseDir, 'accountants');
    if (!fs.existsSync(accountantsDir)) {
      fs.mkdirSync(accountantsDir);
      console.log(`Created 'accountants' directory: ${accountantsDir}`);
    }

    const accountantsData = await User.find({type:'accountant'}).exec();

    const accountantsFilePath = path.join(accountantsDir, 'accountants.txt');
    fs.writeFileSync(accountantsFilePath, JSON.stringify(accountantsData, null, 2), 'utf-8');
    console.log(`Exported all accountant data to ${accountantsFilePath}`);

  } catch (err) {
    console.error("Error exporting accountants data:", err);
  }
}

async function importAdmins() {
  try {
    const baseDir = "./exports";
    const adminsDir = path.join(baseDir, 'admins');
    const adminsFilePath = path.join(adminsDir, 'admins.txt');

    // Check if the file exists
    if (!fs.existsSync(adminsFilePath)) {
      console.error(`No file found at ${adminsFilePath}`);
      return;
    }

    // Read the accountants data from the file
    const adminsData = fs.readFileSync(adminsFilePath, 'utf-8');

    // Parse the data
    const admins = JSON.parse(adminsData);

    if (admins && admins.length > 0) {
      for (let admin of admins) {
        // Assuming you are using Mongoose and the User model has necessary fields for accountant
        const NewAdmin = new User(admin);
        await NewAdmin.save();
      }
      console.log(`Imported ${admins.length} admins into the database.`);
    } else {
      console.log('No admins data found in the file.');
    }

  } catch (err) {
    console.error("Error importing admins data:", err);
  }
}

async function importAccountants() {
  try {
    const baseDir = "./exports";
    const accountantsDir = path.join(baseDir, 'accountants');
    const accountantsFilePath = path.join(accountantsDir, 'accountants.txt');

    // Check if the file exists
    if (!fs.existsSync(accountantsFilePath)) {
      console.error(`No file found at ${accountantsFilePath}`);
      return;
    }

    // Read the accountants data from the file
    const accountantsData = fs.readFileSync(accountantsFilePath, 'utf-8');

    // Parse the data
    const accountants = JSON.parse(accountantsData);

    // Insert accountants data into the database
    if (accountants && accountants.length > 0) {
      for (let accountant of accountants) {
        // Assuming you are using Mongoose and the User model has necessary fields for accountant
        const newAccountant = new User(accountant);
        await newAccountant.save();
      }
      console.log(`Imported ${accountants.length} accountants into the database.`);
    } else {
      console.log('No accountants data found in the file.');
    }

  } catch (err) {
    console.error("Error importing accountants data:", err);
  }
}

async function get_accountant_node(data){
  console.log('get_accountant_node');
  console.log('data.company : '+data.company);
  return  await Node.findOne({
    company:data.company,
    type:'relationship',
    type2:'hiring',
    status: 'executed',
    next: "-"
  })
}


async function clear_db(){
  await drop_collection("Company");
  await drop_collection("Node");
  await drop_collection("User");
  await drop_collection("Item");
  await drop_collection("Report");
  await drop_collection("Warehouse");
  await drop_collection("Series");
  await drop_collection("Person");
  await drop_collection("Document");
  await drop_collection("Notification");
  await drop_collection("Person");
  await drop_collection("Review");
}

module.exports = {
  checkAccessRigts,
  createWarehouse,
  createItem,
  create_user,
  create_admin,
  create_accountant,
  create_company,
  createSeries,
  createReport,
  create_person,
  drop_collection,
  create_doc,
  delete_deactivate,
  create_notification,
  formatDate,
  create_node,
  node_reply,
  get_status,
  update,
  warehose_get_inventory,
  item_get_inventory,
  importExport,
  clear_db,
  get_accountant_node
};
