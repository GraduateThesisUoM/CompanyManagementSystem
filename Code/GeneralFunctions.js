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
const Document = require(path_constants.schemas.one.document);



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

async function create_user(data){
    const user = new Client({
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        email: data.email,
        afm: data.afm,
        mydatakey: data.mydatakey,
        company: data.company,
        companyOwner :data.cOwner
    });
  
    await user.save();
  
    console.log("User " + user.firstName + " " + user.lastName + " Created");  
    return user;
}

async function create_company(data){
    const company = new Company({
        name : data.name,
        logo : data.logo,
        signupcode : data.signupcode
    });
    await company.save();
    console.log("company " + company.name + " Created");
    return company
}

async function create_accountant(data){
    const newAccountant = new Accountant({
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        email: data.email,
        afm: data.afm,
        mydatakey: data.mydatakey
    });

    await newAccountant.save();

    console.log("Accountant " + newAccountant.firstName + " Created");

    return newAccountant;
}

async function create_admin(data){
    const NewAdmin = new User({
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email: data.email
    });
    await NewAdmin.save();
    console.log("Admin " + NewAdmin.firstName + " Created");

    return NewAdmin;
}

async function createWarehouse(data){
    try{
        const warehouse = new Warehouse({
            companyID: data.companyID,
            title : data.title,
            location : data.location
        });
        
        await warehouse.save();
        
        //console.log(warehouse);
        console.log("warehouse"+ warehouse.title+" created");
        
        return warehouse;
    }
    catch(e){
        console.log(e)
    }
}

async function createItem(data){
    try{
        const item = new Item({
            companyID: data.companyID,
            title :data.title,
            description : data.description,
            price_r :data.price_r,
            price_w :data.price_w,
            discount_r :data.discount_r,
            discount_w :data.discount_w,
            tax_r :data.tax_r,
            tax_w :data.tax_w
        });

        console.log("item "+item.title+" created");
        await item.save();
        
        return item;
    }
    catch(e){
        console.log(e)
    }
}

async function createSeries(data){
    try{
        const seies = new Series({
            companyID: data.companyID,
            title :data.title,
            acronym : data.acronym,
            type : data.type,
            sealed : data.sealed
        });
        
        await seies.save();
        
        console.log("seies "+seies.title+" created");

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

async function create_person(data){
    const person = new Person({
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      afm: data.afm,
      phone: data.phone,
      company: data.company
    });
  
    await person.save();
  
    console.log("Person " + person.f_name + " " + person.l_name + " Created");  
    return person;
}

async function create_doc(data){
    try {
        var series = await Series.findOne({_id: data.series});
        series.count = series.count + 1;

        const newDocument = new Document({
            company: data.company,
            sender: data.sender,
            receiver: data.receiver,
            series: data.series,
            type: data.type,
            doc_num : series.count,
            generalDiscount: data.generalDiscount,
            invoiceData: data.invoiceData,
        });

        // Save the document to the database
        await newDocument.save();
        console.log('Document saved successfully');

        
        await series.save();

        return newDocument;
    } catch (error) {
        console.error('Error saving document:', error);
    }
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
    createSeries,createReport,create_person,drop_collection,create_doc};
