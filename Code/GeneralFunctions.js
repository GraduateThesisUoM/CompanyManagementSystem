//File with the paths
const path_constants = require("./constantsPaths");
const fs = require("fs");
const path = require("path");
var mongoose = require("mongoose");
const { create } = require("./Schemas/Node");


//Models
const Client = require(path_constants.schemas.one.client);
const Warehouse = require(path_constants.schemas.one.warehouse);
const Item = require(path_constants.schemas.one.item);
const Company = require(path_constants.schemas.one.company);
const Accountant = require(path_constants.schemas.one.accountant);
const User = require(path_constants.schemas.one.user);
const Series = require(path_constants.schemas.one.series);
const Person = require(path_constants.schemas.one.person);
const Document = require(path_constants.schemas.one.document);
const Notification = require(path_constants.schemas.one.notification);
const Node = require(path_constants.schemas.one.node);
const Review = require(path_constants.schemas.one.review);
const Attendance = require(path_constants.schemas.one.attendance);


const schemaMap = {
  users: User,
  notifications: Notification,
  companys: Company,
  clients: Client,
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

  new_data = {
    company: data.company,
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    type: data.type,
    status: 3,//pending
    text: data.text
  };

  
  
  if (data.type == 1) {//relationship
    if ((data.company.equals(data.receiver_id) && data.type2 == 1)|| (data.type2 == 2)) {
      new_data.status = 2 //executed;
    }
    else if (data.type2 == 3){
      new_data.status = 2
    }

  } else if (data.type == 3) {//request
    new_data = {
      ...new_data, // Spread existing properties
      title: data.title,
      due_date: data.due_date,
    };
  }
  else if (data.type == 6){
    new_data.status = 2;
  }

  if(data.type2) new_data.type2 = data.type2;
  if(data.receiver_id) new_data.receiver_id = data.receiver_id;
  

  const new_node = new Node(new_data);
  if(data.data) new_node.data = data.data;


  await new_node.save();

  return new_node;
}

async function node_reply(data) {
  console.log("node_reply")
  console.log(data)
  const target_node = await Node.findOne({ _id: data.target_node._id });
  var new_node;

  if( target_node.type == 1){//1=relationship
    if( data.reply == 4){
      target_node.status = 4;
      new_node =  target_node;
    }
    else{
      new_node = await create_node({
        company: target_node.company,
        sender_id: target_node.sender_id,
        receiver_id: target_node.receiver_id,
        type: 1,
        type2: 3,
      })
      target_node.status = 2;
      target_node.next = new_node._id;
    }
    await target_node.save()
    return new_node
  }
  else if( target_node.type == 3){
    var receiver = target_node.sender_id

    if(data.user.equals(target_node.sender_id)){
      receiver = target_node.receiver_id
    }

    new_node = await create_node({
      company: target_node.company,
      sender_id: data.user,
      receiver_id: receiver,
      due_date: target_node.due_date,
      title : target_node.title,
      type: 3,
      type2: target_node.type2,
      text : data.text
    })

    target_node.next = new_node._id
    target_node.status = data.reply

    await target_node.save()
    return new_node
  } 
  
  
  /*if( target_node.type == 1){//1=relationship
    reply_node.type2 = data.reply;
    if(data.reply == 1){//1=hiring
      reply_node.status = 2// executed
    }
    else{
      reply_node.status = 4 // rejected
    }
  }
  else if(target_node.type == 4){//request
    var new_data = {
      company: data.company,
      type: target_node.type,
      type2: target_node.type2,
      status: 3,//pending
      text: data.text
    };
    if(target_node.sender_id == data.sender_id){
      new_data.sender_id = target_node.sender_id
      new_data.receiver_id = target_node.receiver_id
    }
    else{
      new_data.sender_id = target_node.receiver_id
      new_data.receiver_id = target_node.sender_id
    }
    const new_node = new Node(new_data);
  }

  // -------------receiver_id
  var receiver = target_node.sender_id;
  if(receiver == data.user._id || data.reply == 6){
    receiver = target_node.receiver_id
  }


  const reply_node = await create_node({
    company: target_node.company,
    sender_id: data.user._id,
    receiver_id: receiver,
    type: target_node.type,
  });
  if(data.user._id != target_node.sender_id){
    reply_node.status = 2;//executed
  }
  reply_node.title = target_node.title;//executed

  if( target_node.type == 1){
    reply_node.type2 = data.reply;
  }
  if( target_node.type == 3){//request
    reply_node.type2 = 3;//response
  }

  // -------------type
  /*if (data.reply) reply_node.type = data.reply;

  // -------------type2
  if (data.reply == 6) reply_node.type2 = 6;
  else if (target_node.type2 == 1) reply_node.type2 = 1;

  // -------------status
  if (data.status)reply_node.status = data.status
  else if ([2, 3, 6].includes(data.reply))reply_node.status = 2;*/

  /*if (data.text) reply_node.text = data.text;
  if (data.data) reply_node.data = data.data;


  await reply_node.save();

  target_node.next = new mongoose.Types.ObjectId(reply_node._id);
  target_node.status = 2;//executed
  await target_node.save();

  return reply_node;*/
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
    console.log("fffffffffffffffffffffffffffffff")
    console.log(data.transforms_to)
    const series = new Series({
      company: data.company,
      title: data.title,
      acronym: data.acronym,
      type: data.type,
      sealed: data.sealed,
      effects_warehouse: data.effects_warehouse,
      effects_account: data.effects_account,
    });
    if (data.transforms_to != 0){
      series.transforms_to = data.transforms_to.split(';');
      console.log(series.transforms_to)
      series.transforms_to = series.transforms_to.map(id => new mongoose.Types.ObjectId(id));

    }
    else{
      console.log("000000000000")
      series.transforms_to = []
    }

    await series.save();

    console.log("seies " + series.title + " created");

    return series;
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
      invoiceData: data.invoiceData
    });

    if(data.next) newDocument.next = data.next;

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
    console.log("delete_deactivate action : "+action)
    var obj = await get_obj_by_id(data, schema);
    if (action == "delete" || action == 2) {
      obj.status = 2;
    } else if (action == "activate"|| action == 1 ) {
      obj.status = 1;
    } 
    else {
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
    console.log(data);

    var obj = await get_obj_by_id(id, schema);
    var fieldsToUpdate;

    if (schema == 'documents') {
      obj.generalDiscount = data.generalDiscount; 
      obj.warehouse = data.warehouse
      obj.invoiceData = data.invoiceData;
    }
    else if(schema == 'nodes') {
      obj.text = data.text; 
    }
    else if (schema == 'series') {
        obj.title = data["input0"];
        obj.acronym = data["input1"];
        obj.type = data["input2"];
        obj.count = data["input3"];

        obj.sealed = data["input4"];
        obj.effects_warehouse = data["input5"];
        obj.credit = data["input6"];
        obj.debit = data["input7"];

        obj.active = data["input8"];
        obj.transforms = data["input9"];
        console.log(data["series_transforms_list"])
        if(data["series_transforms_list"] != ""){
          obj.transforms_to = data["series_transforms_list"].split(',')
        }
        else{
          obj.transforms_to = []
        }
      }
    else if (schema == 'users') {
      obj.firstName = data.input0
      obj.lastName = data.input1
      obj.email = data.input2
    }
    else if (schema == 'Warehouse') {
      obj.title = data.input0
      obj.location = data.input1
    }
    else if (schema == 'items') {
      obj.title = data.input0
      obj.description= data.input1
      obj.price_r = data.input4
      obj.price_w = data.input5
      obj.discount_r = data.input6
      obj.discount_w = data.input7
      obj.tax_r = data.input8
      obj.tax_w  = data.input9
    }
    else if (schema == 'persons') {
      obj.firstName = data.input0
      obj.lastName = data.input1
      obj.email = data.input2
      obj.phone = data.input3
      obj.afm = data.input4

      obj.address = data.input7
      obj.district = data.input8
      obj.city = data.input9
      obj.country = data.input10
      obj.zip = data.input11
    }

    console.log(obj);
      
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

function get_status(id) {
  switch (id) {
    case 1:
      return "Viewed";
    case 2:
      return "Executed";
    case 3:
      return "Pending";
    case 4:
      return "Rejected";
    case 5:
      return "Canceled";
    case 6:
      return "Temp";
    default:
      return "Unknown status";
  }
}

function get_status_user(id) {
  switch (id) {
    case 0:
      return "Disabled";
    case 1:
      return "Active";
    case 2:
      return "Deleted";
    case 3:
      return "Baned";
    default:
      return "Unknown status";
  }
}

function get_type(id){
  switch (id) {
    case 1:
      return "Clients";//Relationship
    case 2:
      return "Response";
    case 3:
      return "Request";
    case 4:
      return "Node";
    case 6:
      return "Warehouse";
    case 7:
      return "Time Table";
    case 8:
      return "Report";
    case 31:
      return "Enter";
    case 32:
      return "Leave";
    case 33:
      return "License";
    default:
      return "Unknown type";
  }
}

function get_type2(id){
  switch (id) {
    case 1:
      return "Hiring";
    case 2:
      return "Firing";
    case 3:
      return "Response";
    case 4:
      return "Request";
    case 6:
      return "Node";
    case 7:
      return "Shell";
    case 8:
      return "Buy";
    case 31:
      return "Other";
    case 32:
      return "Payroll";
    case 33:
      return "Timetable";
    case 34:
      return "Hire/Fire";
    case 71:
      return "Harassment";
    case 72:
      return "Pretending to be someone";
    case 73:
      return "Fraud/Scam/Malpractice";
    case 74:
      return "Other";
    case 75:
      return "License for changes in the number of licenses";
    default:
      return "Unknown type";
  }
}

const formatDateTime = (dateString) => {
  if(dateString == null){
    return ""
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatDate = (dateString) => {
  if(dateString == null){
    return "-"
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  //return `${day}/${month}/${year} ${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
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

async function record_scan(data){
  console.log(data)
  // Get today's date in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Find the last scan where clock_out is not set and registrationDate is today
  const last_scan = await Attendance.findOne({
    user: data.user._id, // Match the user ID
    company: data.user.company, // Match the company
    clock_out: { $exists: false }, // Ensure clock_out is not set
    registrationDate: { $gt: today }
  });

  var new_node;

  if(last_scan){
    last_scan.clock_out = new Date(); // Set the current timestamp
    await last_scan.save();
    console.log('Clock-out time recorded:', last_scan);
    return 0; // Leave
  }
  
   // Create a new attendance record if no open attendance exists
   new_node = new Attendance({
    user: data.user._id,
    company: data.user.company
  });

  await new_node.save();
  console.log('New attendance record created:', new_node);
  return 1; // Entered

}

async function clear_db(){
  await drop_collection("Company");
  await drop_collection("Node");
  await drop_collection("User");
  await drop_collection("Item");
  await drop_collection("Warehouse");
  await drop_collection("Series");
  await drop_collection("Person");
  await drop_collection("Document");
  await drop_collection("Notification");
  await drop_collection("Person");
  await drop_collection("Review");
}

async function get_persons_moves(data){
  var docs = await Document({
    company:data.company,
    sender:data.sender,
    status:1//active
  });

  return docs;
}

async function get_accountant_node(company_id){
  return Node.findOne({company:company_id,next:'-',status:2,type:1,type2:3})
}

function calculateDateDifference(inputDate) {
  const now = new Date();
  const date = new Date(inputDate);

  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();
  let days = now.getDate() - date.getDate();

  // Adjust for negative values
  if (days < 0) {
      months--;
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
  }

  if (months < 0) {
      years--;
      months += 12;
  }

  return { years, months, days };
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
  create_person,
  drop_collection,
  create_doc,
  delete_deactivate,
  create_notification,
  formatDate,
  formatDateTime,
  create_node,
  node_reply,
  get_status,
  get_status_user,
  get_type,
  get_type2,
  update,
  warehose_get_inventory,
  item_get_inventory,
  importExport,
  clear_db,
  get_persons_moves,
  record_scan,
  get_accountant_node,
  calculateDateDifference
};
