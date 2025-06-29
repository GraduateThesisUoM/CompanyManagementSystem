//File with the paths
const path_constants = require("./constantsPaths");
const fs = require("fs");
const path = require("path");
var mongoose = require("mongoose");
const { create } = require("./Schemas/Node");
const { Admin, ConnectionClosedEvent } = require("mongodb");


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
const Node = require(path_constants.schemas.one.node);
const Attendance = require(path_constants.schemas.one.attendance);


const schemaMap = {
  users: User,
  companies: Company,
  clients: Client,
  series: Series,
  items: Item,
  warehouse: Warehouse,
  persons: Person,
  accountants: Accountant,
  nodes: Node,
  documents: Document,
};

const disabled_company_accesable_pages = ["/","/my-company"];
const company_owner_accesable_pages = ["/my-company"];

function checkAccessRigts(req) {
  console.log("checkAccessRigts");
  try {
    var page_url = req.baseUrl;
    if(req.baseUrl == ''){
      page_url = '/';
    }
    
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

  new_data = {
    company: data.company,
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    type: data.type,
    type2 : data.type2,
    status: 3,//pending
    text: data.text
  };


  if (data.type == 1) {//relationship
    if ((data.company.equals(data.receiver_id) && data.type2 == 1/*data.type2 == 3*/)) {
      new_data.status = 2 //executed;
      new_data.type2 = 3;
    }
    else if ((data.type2 == 2) || (data.type2 == 3)){//kataxorisi node gia relationship
      new_data.status = 2
    }

  } else if (data.type == 3) {//request
    new_data = {
      ...new_data, // Spread existing properties
      title: data.title,
      due_date: data.due_date,
    };
  }  else if (data.type == 6){
    new_data.data = data.data;
    new_data.status = 2;
  }

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
    new_node = await create_node({
      company: target_node.company,
      sender_id: target_node.sender_id,
      receiver_id: target_node.receiver_id,
      type: 1,
      type2: data.type2,
    })
    target_node.status = 2;
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

    console.log('new node333333333333')

    target_node.status = data.reply
  }
  else if ( target_node.type == 6){
    new_node = await create_node({
      company: target_node.company,
      sender_id: data.user,
      receiver_id: target_node.receiver_id,
      type: 6,
      type2: data.type2,
      data: data.data,
      text : data.text
    })
  }
  else if ( target_node.type == 10){
    var st = 2
    if(data.text == 'rejected'){
      st=4
    }
    new_node = await create_node({
      company: target_node.company,
      sender_id: data.user,
      receiver_id: target_node.receiver_id,
      type: 10,
      type2: 6,
      text : data.text
    })

    new_node.status = st;
  }
  await new_node.save()
  target_node.next = new_node._id;
  await target_node.save()
  return new_node
 
}

async function create_company(data) {
  const company = new Company({
    name: data.name,
    logo: data.logo,
    signupcode: data.signupcode,
  });
  await company.save();

  var transfer_series = await createSeries({
    company: company._id,
    title: "Transfer",
    acronym: "TR",
    type: 3,
    sealed: 1,
    effects_warehouse: 0,
    effects_account: 0,
    transforms_to : 0
  });

  if(data.plan){
    company.license.bought = data.plan;
    await company.save();
  }



  transfer_series.my_id = path_constants.my_constants.transfer_series_my_id,
  await transfer_series.save();

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

    const tax_r = parseFloat(Number(data.tax_r).toFixed(2));
    const tax_w = parseFloat(Number(data.tax_w).toFixed(2));


    const item = new Item({
      type:data.type,
      company: data.company,
      //type: data.type,
      title: data.title,
      description: data.description,
      price_r: data.price_r,
      price_w: data.price_w,
      discount_r: data.discount_r,
      discount_w: data.discount_w,
      tax_r: tax_r,
      tax_w: tax_w,
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
    console.log("createSeries")
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
    console.log(data)
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

async function warehouse_get_inventory(data){
  console.log("warehouse_get_inventory")
  var items = await Item.find({
    company : data.company,
    status : 1
  })

  var item_list = []

  for(const i of items){
    item_list.push({
      id : i._id.toString(),
      title : i.title,
      quantity :  await get_item_warehouse_inventory({company:data.company, item:i._id,warehouse:data.id})
    })
  }

  return item_list;

}

async function inventory_count(data){
  console.log("inventory_count");

  var inventory = 0;

  for( d of data.docs){
    for( key in d.invoiceData){
      if(d.invoiceData[key].lineItem == data.item){
        inventory = inventory + (data.action*parseInt(d.invoiceData[key].quantity));
      }
    }
  }

  return inventory;
}


async function get_item_warehouse_inventory(data){
  console.log("get_item_warehouse_inventory");
  var inventory = 0;

  var transfers = await get_item_warehouse_inventory_from_transfers({
    company: data.company,
    item: data.item,
    warehouse: data.warehouse
  });

  var actions = [1, -1];
  for (const action of actions) {
    var series = await Series.find({
      company: data.company,
      effects_warehouse: action,
    })

    var docs = await Document.find({
      company: data.company,
      series: { $in: series.map(s => s._id) },
      warehouse: data.warehouse,
      edited: 0
    });

    inventory = inventory + await inventory_count({
      series: series,
      company: data.company,
      warehouse: data.warehouse,
      item: data.item,
      docs: docs,
      action: action
    })
  }


  inventory = inventory + transfers;
 

  return inventory;
}

async function get_item_warehouse_inventory_from_transfers(data){
  console.log("get_item_warehouse_inventory_from_transfers");
  console.log(data);

  var series = await Series.findOne({
    company:data.company,
    type: 3,
    my_id: path_constants.my_constants.transfer_series_my_id,
  });

  var docs = await Document.find({
    series: series._id, 
    company: data.company,
    receiver: data.warehouse,
    edited: 0
  });

  var inventory =  await inventory_count({
    series: series,
    company: data.company,
    warehouse: data.warehouse,
    item: data.item,
    docs: docs,
    action: 1
  })

  var docs = await Document.find({
    series: series._id, 
    company: data.company,
    warehouse: data.warehouse,
    edited: 0
  });

  inventory = inventory + await inventory_count({
    series: series,
    company: data.company,
    warehouse: data.warehouse,
    item: data.item,
    docs: docs,
    action: -1
  })

  return inventory;
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
    /*if(schema == 'companies'){
      schema = 'Company'
    }*/
   if(schema=='docs'){
    schema = 'documents'
   }
    const Model = schemaMap[schema]; // Retrieves an existing model
        var obj = await get_obj_by_id(data, schema);
    if (action == "delete" || action == 2) {
      if(await check_for_delete({obj:obj,schema:schema})){
        await Model.deleteOne({ _id: obj._id });
        return 1;
      }
      else{
        obj.status = 0;
        await obj.save();

        return 2;
        //obj.status = 2;
        //await obj.save();
        //return 2//IS USED IN DOC OR HAS INVENTORY;
      }
    } else if (action == "activate"|| action == 1 ) {
      obj.status = 1;
    } 
    else {
      obj.status = 0;
    }
    await obj.save();
    return 1;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

async function get_obj_by_id(data, schema) {
  const Model = schemaMap[schema];
  if (!Model) {
    throw new Error(`Schema ${schema} not found`);
  }
  return await Model.findOne(data);
}

async function check_for_delete(data) {
  console.log("check_for_delete")
  var results;
  var count = 0;
  const Model = schemaMap[data.schema]; // Retrieves an existing model
    if(Model == Person){
      results = await Document.find({sender:data.obj._id});
      count = count + results.length;
      if(count == 0){
        results = await Document.find({receiver:data.obj._id});
        count = count + results.length;
        if(count == 0){
          return true;
        }
      }
    }
    else if(Model == Warehouse){
      results = await warehouse_get_inventory({
        company : data.obj.company,
        id : data.obj._id
      })
      results.forEach(item => {
        count += item.quantity;
      });
      console.log(count);
      console.log(results);

    }
    else if(Model == Item){
      var warehouses = await Warehouse.find({ company: data.obj.company, status: 1 });
      for (w of warehouses) {
        results = await get_item_warehouse_inventory({
          company:data.obj.company,
          item:data.obj._id,
          warehouse:w._id
        })
  
        count = count + results
      }
    }
    else if(Model == Document){
      if(data.obj.next !='-' || data.obj.sealed == 1){
        count = 1;
      }
    }

  if(count == 0){
    return true;
  }
  return false;
}


async function update(id, schema , data){
  try {
    console.log("update");
    var obj = await get_obj_by_id(id, schema);
    console.log(obj);
    console.log('update '+schema);
    console.log(data);

    if (schema == 'documents') {
      obj.generalDiscount = data.generalDiscount; 
      obj.warehouse = data.warehouse
      obj.invoiceData = data.invoiceData;
    }
    else if(schema == 'nodes') {
      console.log(obj)
      if(obj.type == 1 && obj.type2 == 1){
        var relationshipNode = node_reply({
          target_node : obj,
          type2: 3,
          status: data.action});
      }
      else{
        var node_repl = node_reply({
          user : data.user,
          target_node : obj,
          type2: 3,
          status: data.action,
          text : data.input5,
          reply : data.action
        });
      }
       
    }
    else if (schema == 'series') {
        obj.title = data["input0"];
        obj.acronym = data["input1"];

        obj.sealed = data["series_sealed"];
        obj.effects_warehouse = data["effects_warehouse_y_n_input"];
        obj.effects_account = data["effects_accounts_y_n_input"];
        /*obj.credit = data["input6"];
        obj.debit = data["input7"];

        obj.active = data["input8"];*/
        console.log(data["series_transforms_list"])
        if(data["series_transforms_list"] != ""){
          obj.transforms_to = data["series_transforms_list"].split(';')
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
      obj.title = data.items_title
      obj.description= data.items_description,
      obj.status= data.status,
      obj.price_r = data.items_price_r
      obj.price_w = data.items_price_w
      obj.discount_r = data.items_price_r_disc
      obj.discount_w = data.items_price_w_disc
      obj.tax_r = data.items_tax_r
      obj.tax_w  = data.items_tax_w
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
    else if (schema == 'clients'){
      var targ = await Node.findOne({company:id,type:1,type2:3,status:2,next:'-'});
      console.log(targ)
      var relationshipNode = node_reply({
        target_node : targ,
        type2: 9,
        status: 2});
        var req = await Node.find({
          company: id,
          //receiver_id: targ.receiver_id, 
          type: 3, 
          type2: { $in: [31,32,33,34] },
          status: { $in: [1,3] }
        });

        for(r of req) {
          r.status = 5; // Set status to 5 (Canceled)
          await r.save();
        }
    }

    console.log(obj);
    await obj.save();
      
  } catch (e) {
    console.log(e);
  }
}

function go_after(url) {
  if (url.includes('view')) {
    window.location = '/list';
  } else {
    window.location = '/';
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

async function importExport(action,schema, company,path) {
  try {
    if (!['export', 'import','export_accountants','export_admins'].includes(action)) {
      throw new Error("Invalid action. Please specify 'export' or 'import'.");
    }
    if(schema == 'company' ){
      await resetAndImportData(company,path);
    }
    else{
      await importUserType(User,schema,path);//admin or accountant
    }

  } catch (error) {
    console.error("Error in master function:", error);
  }
}

async function exportData(company = null) {
  try {

    const baseDir = path_constants.my_constants.export_path;
    

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
      console.log(`Created exports directory: ${baseDir}`);
    }

    let schemas = Object.keys(schemaMap);
    let companies;

    if (company != null) {
      companies = await Company.find({ _id: new mongoose.Types.ObjectId(company) });
      if (companies.length === 0) {
        console.warn(`No company found with ID: ${company}`);
        return;
      }
    } else {
      companies = await Company.find({});
      if (companies.length === 0) {
        console.warn("No companies found.");
        return;
      }
    }

    for (const company of companies) {
      const companyDir = path.join(baseDir, `${company._id}`);
      if (!fs.existsSync(companyDir)) {
        fs.mkdirSync(companyDir);
        console.log(`Created directory for company '${company.name}': ${companyDir}`);
      }

      let allData = {};

      for (const schema of schemas) {
        const model = schemaMap[schema];
        if (!model) {
          console.warn(`Schema '${schema}' not found.`);
          continue;
        }

        let data;
        if (model.modelName === "Company") {
          data = await model.find({ _id: company._id }).exec();
        } else if (model.modelName === "Client") {
          data = await model.find({ __t: "client", company: company._id, type: "user" }).exec();
        } else if (schema === "accountants" || schema === "users") {
          continue;
        } else {
          data = await model.find({ company: company._id }).exec();
        }

        allData[schema] = data;
      }

      const filePath = path.join(companyDir, `exported_data.json`);
      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), "utf-8");
      console.log(`Exported all data for company '${company.name}' to ${filePath}`);
    }
  } catch (err) {
    console.error("Error exporting data:", err);
  }
}

async function resetAndImportData(companyId) {
  try {
    const filePath = `C:\\exports\\${companyId}\\exported_data.json`;

    if (!fs.existsSync(filePath)) {
      console.warn(`No export file found for company '${companyId}' at ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const allData = JSON.parse(rawData);

    if (!allData[companyId] || !allData[companyId].data) {
      console.warn(`Invalid JSON structure. No data found for company '${companyId}'.`);
      return;
    }

    const companyData = allData[companyId].data;

    // Step 1: Delete existing data for the company
    for (const schema of Object.keys(companyData)) {
      const model = schemaMap[schema];
      if (!model) {
        console.warn(`Schema '${schema}' not found.`);
        continue;
      }

      const idsToDelete = companyData[schema].map(doc => doc._id);
      if (idsToDelete.length > 0) {
        await model.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Deleted existing records in '${schema}' for company '${companyId}'`);
      }
    }

    // Step 2: Insert all data exactly as it is
    for (const schema of Object.keys(companyData)) {
      const model = schemaMap[schema];
      if (!model) {
        console.warn(`Schema '${schema}' not found.`);
        continue;
      }

      if (companyData[schema].length > 0) {
        await model.insertMany(companyData[schema], { ordered: false });
        console.log(`Inserted records into '${schema}' as they were in the JSON`);
      }
    }

    console.log(`Database restored exactly as in the JSON file`);
  } catch (err) {
    console.error("Error restoring data:", err);
  }
}

async function importUserType(UserSchema, userType,path) {
  try {
    //const baseDir = path_constants.my_constants.export_path;
    //const userDir = path.join(baseDir, userType);
    //const userFilePath = path.join(userDir, `${userType}.json`);
    const userFilePath = path
    console.log(userFilePath)

    if (!fs.existsSync(userFilePath)) {
      console.error(`No file found to import ${userType} data from.`);
      return;
    }

    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));

    /*await UserSchema.insertMany(userData);
    console.log(`Imported ${userData.length} ${userType}(s) from ${userFilePath}`);*/

    const bulkOps = userData.map(user => ({
      updateOne: {
        filter: { _id: user._id }, // Match by _id
        update: { $set: user }, // Overwrite existing fields
        upsert: true // Insert if not found
      }
    }));

    // Perform bulkWrite operation
    const result = await UserSchema.bulkWrite(bulkOps);

    console.log(`Imported ${result.upsertedCount} new ${userType}(s) and updated ${result.modifiedCount} existing.`);

  } catch (err) {
    console.error(`Error importing ${userType} data:`, err);
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

async function gets_movements(data) {
  console.log('gets_movements');

  let query = { receiver: data.user._id };

  // Apply date filtering only if valid 'from' or 'to' is provided
  if (data.from || data.to) {
      query.registrationDate = {};
      if (data.from) query.registrationDate.$gte = new Date(data.from);
      if (data.to) query.registrationDate.$lte = new Date(data.to);
  }

  var docs = await Document.find(query);
  console.log("docs:", docs);

  var movements = [];
  for (let d of docs) {
      const series = await Series.findOne({ _id: d.series, company: d.company });
      movements.push({
          _id: d._id,
          registrationDate: formatDateTime(d.registrationDate),
          doc: series.acronym + "-" + d.doc_num,
          credit: series.effects_account == 1 ? get_docs_value(d) : 0,
          debit: series.effects_account == -1 ? get_docs_value(d) : 0,
      });
  }
  return movements;
}


function get_docs_value(data) {
  var total = 0;
  console.log('get_docs_value')

  const g_discount = parseFloat(data.generalDiscount)/Object.values(data.invoiceData).length;
  for(let key in data.invoiceData) {
    const row = data.invoiceData[key];
    const price = parseFloat(row.price_of_unit);
    const quantity = parseFloat(row.quantity); 
    const discount = parseFloat(row.discount);
    const tax = parseFloat(row.tax);

    const subtotal = (price * quantity);
    const  discounted = subtotal  - (discount+g_discount);
    const withTax = discounted * (1 + tax/100);
    
    total += withTax;
  }
  return total;
}

module.exports = {
  schemaMap,
  checkAccessRigts,
  gets_movements,
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
  formatDate,
  formatDateTime,
  create_node,
  node_reply,
  get_status,
  get_status_user,
  get_type,
  get_type2,
  update,
  warehouse_get_inventory,
  get_item_warehouse_inventory_from_transfers,
  importExport,
  clear_db,
  get_persons_moves,
  record_scan,
  get_accountant_node,
  calculateDateDifference,
  get_docs_value,
  get_item_warehouse_inventory
};
