//File with the paths
const path_constants = require('./constantsPaths');

//Libraries
const bcrypt = require('bcrypt');


//Models
const Client  = require("./Schemas/Client");
const Warehouse  = require("./Schemas/Warehouse");
const Item  = require("./Schemas/Item");
const Company  = require("./Schemas/Company");
const Accountant  = require("./Schemas/Accountant");
const User  = require("./Schemas/User");
const Series  = require("./Schemas/Series");


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
            console.log("access granted");
            return true;
        }
        if(page_user_type == req.user.type){
            console.log("access granted");
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

async function create_company(index){
    const company = new Company({
        name : 'c'+index,
        //logo : req.body.companyLogo,
        logo : "https://static.vecteezy.com/system/resources/previews/008/214/517/non_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg",
        signupcode : '1'
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
        
        await seies.save();
        
        //console.log(warehouse);
        console.log("seies "+title+" created");

        return seies;
        
    }
    catch(e){
        console.log(e)
    }
}


module.exports = { checkAccessRigts, createWarehouse, createItem, create_user,create_admin,create_accountant,create_company,createSeries};
