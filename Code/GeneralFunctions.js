//File with the paths
const path_constants = require("./constantsPaths");

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
  warehouses: Warehouse,
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
  try {
    var page_url = req.baseUrl;
    if(req.baseUrl == ''){
      page_url = '/';
    }
    console.log(page_url)
    console.log(disabled_company_accesable_pages.includes(page_url));
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
  var status = "pending";
  var new_data = {};
  console.log(data);
  if (data.type == "relationship") {
    if (data.company_id.equals(data.receiver_id) && data.type2 == "hiring") {
      status = "executed";
    } else if (data.type2 == "firing") {
      status = "executed";
    }
    new_data = {
      company_id: data.company_id,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      type: data.type,
      type2: data.type2,
      status: status,
    };
  } else if (data.type == "request") {
    new_data = {
      company_id: data.company_id,
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
  console.log(new_data);

  const new_node = new Node(new_data);

  await new_node.save();

  return new_node;
}

async function node_reply(data) {
  console.log("node_reply")
  const target_node = await Node.findOne({ _id: data.target_node._id });
  var sts = "pending";
  console.log("---------------------------------------"+data.reply+'firing')
  if (data.reply == 'firing') {
    sts = "executed";
  }
  console.log("---------------------------------------"+sts)

  const reply_node = await create_node({
    company_id: target_node.company_id,
    sender_id: target_node.sender_id,
    receiver_id: target_node.receiver_id,
    type: target_node.type,
    type2: data.reply,
    text: data.text,
    status: sts,
  });

  await reply_node.save();

  target_node.next = reply_node._id;
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
      companyID: data.companyid,
      title: data.title,
      location: data.location
    });

    await warehouse.save();

    //console.log(warehouse);
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
      companyID: data.companyID,
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
      companyID: data.companyID,
      title: data.title,
      acronym: data.acronym,
      type: data.type,
      sealed: data.sealed,
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
    var obj = await get_obj_by_id(data, schema);
    if (action == "delete") {
      obj.status = 2;
    } else if (action == "activate") {
      obj.status = 1;
    } else {
      obj.status = 0;
    }
    console.log(obj);
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
    console.log(data)
    var obj = await get_obj_by_id(id, schema);
    if (schema == 'series') {
      console.log("****************************************")
      const fieldsToUpdate = ['title', 'acronym', 'type', 'sealed', 'active'];
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
  companyID,
  relevantCompanyID,
  notificationType
) {
  // check if a notification of the same type exists for user
  var exist_check = await Notification.findOne({
    $and: [
      { user_id: userID },
      { type: notificationType },
      { company_id: companyID },
      { status: "unread" },
    ],
  });
  var stus = "unread";
  if (companyID == relevantCompanyID) {
    stus = "read";
  }

  // if not
  if (exist_check == null) {
    const newNotification = new Notification({
      //Notification constructor
      user_id: userID,
      relevant_user_id: relevantUserID,
      company_id: companyID,
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
  update
};
