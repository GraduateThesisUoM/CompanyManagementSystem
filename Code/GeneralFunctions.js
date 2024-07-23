//File with the paths
const path_constants = require('./constantsPaths');

//Libraries
const bcrypt = require('bcrypt');

var mongoose = require('mongoose');

//Models
const Client  = require(path_constants.schemas.one.client);
const Warehouse  = require(path_constants.schemas.one.warehouse);
const Item  = require(path_constants.schemas.one.item);
const Company  = require(path_constants.schemas.one.company);
const Accountant  = require(path_constants.schemas.one.accountant);
const User = require(path_constants.schemas.one.user);
const Series = require(path_constants.schemas.one.series);
const Report = require(path_constants.schemas.one.report);
const Person = require(path_constants.schemas.one.person);


//function checkAccessRigts(req, data ,res){
function checkAccessRigts(req){
    try{
        var file_path = "";
        // Iterate over each key-value pair in the pages object
        for (const [page, pageData] of Object.entries(path_constants.pages)) {
            if (pageData.url === req.originalUrl) {
                file_path = pageData.file; // Access the file path directly
                break; // Correct spelling of break
            }
        }
        var page_user_type = "general";
        if( file_path.startsWith(path_constants.routes.user)){
            page_user_type = "user";
        }
        else if( file_path.startsWith(path_constants.routes.accountant)){
            page_user_type = "accountant";
        }
        else if( file_path.startsWith(path_constants.routes.admin)){
            page_user_type = "admin";
        }
        else{
            //console.log("access granted");
            return true;
        }
        if(page_user_type == req.user.type){
            //console.log("access granted");
            return true;
        }
        return true
    }
    catch(e){
        console.log(e)
        return false;
    }
}

async function create_user(text,company,cOwner){
    const user = new Client({
      type: 'user',
      firstName: text+'_fn',
      lastName: text+'_ln',
      password: await bcrypt.hash('1', 10),
      email: text+"@"+text,
      afm: text+'_afm',
      mydatakey: text+'_mdk',
      company: company._id,
      companyOwner :cOwner
    });
  
    await user.save();
  
    console.log("User " + text + " Created");  
    return user;
}

async function create_company(name,logo,signupcode){
    const company = new Company({
        name : name,
        //logo : logo,
        logo : "https://static.vecteezy.com/system/resources/previews/008/214/517/non_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg",
        signupcode : signupcode
    });
    await company.save();
    console.log("company " + company.name + " Created");
    return company
}

async function create_accountant(text){
    const newAccountant = new Accountant({
        type: 'accountant',
        firstName: text+'_fn',
        lastName: text+'_ln',
        password: await bcrypt.hash('1', 10),
        email: text+"@"+text,
        afm: text+'_afm',
        mydatakey: text+'_mdk'
    });

    await newAccountant.save();

    console.log("Accountant " + newAccountant.firstName + " Created");

    return newAccountant;
}

async function create_admin(text){
    const NewAdmin = new User({
      type: 'admin',
      firstName: text+"_fn",
      lastName: text+"_ln",
      password: await bcrypt.hash('1', 10),
      email: text+"@"+text
    });
    await NewAdmin.save();
    console.log("Admin " + NewAdmin.firstName + " Created");

    return NewAdmin;
}

async function createWarehouse(companyID, title, location){
    try{
        const warehouse = new Warehouse({
            companyID: companyID,
            title :title,
            location : location
        });
        
        await warehouse.save();
        
        //console.log(warehouse);
        console.log("warehouse"+title+" created");
        
        return warehouse;
    }
    catch(e){
        console.log(e)
    }
}

async function createItem(companyID, title, description, price_r, discount_r, price_w,discount_w){
    try{
        const item = new Item({
            companyID: companyID,
            title :title,
            description : description,
            price_r :price_r,
            price_w :price_w,
            discount_r :discount_r,
            discount_w :discount_w
        });

        console.log("item "+title+" created");
        await item.save();
        
        return item;
    }
    catch(e){
        console.log(e)
    }
}

async function createSeries(companyID, title){
    try{
        const seies = new Series({
            companyID: companyID,
            title :title
        });
        //show reqested license
        
        await seies.save();
        
        console.log("seies "+title+" created");

        return seies;
        
    }
    catch(e){
        console.log(e)
    }
}

async function createReport(userid,reportedid,reportreason,reporttext){
    try{
        const newReport = new Report({ //report constructor
            reporter_id: userid, //reporter id
            reported_id: reportedid, //reported id
            reason: reportreason, //reason for report (taken from a radio in report page or inserted by the user)
            text: reporttext //report text-details
          });

        console.log("Report for "+reportreason+" created");
        await newReport.save();

        return newReport;
    }
    catch(e){
        console.log(e)
    }
}

async function create_person(f_name,l_name,email,vat,phone,company){
    const person = new Person({
      type: 'user',
      firstName: f_name,
      lastName: l_name,
      email: email,
      afm: vat,
      phone: phone,
      company: company

    });
  
    await person.save();
  
    console.log("Person " + f_name + " " + l_name + " Created");  
    return person;
}

async function drop_collection(collection_name){
    try {
        const Collection = mongoose.model(collection_name);
          await Collection.collection.drop();
          console.log("Collection "+collection_name+" deleted successfully.");
      } catch (error) {
          console.error("Error deleting collection "+collection_name+":", error);
      }
}
module.exports = {
    checkAccessRigts, createWarehouse, createItem, create_user,create_admin,create_accountant,create_company,
    createSeries,createReport,create_person,drop_collection};
