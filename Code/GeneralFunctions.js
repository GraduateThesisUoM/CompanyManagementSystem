//File with the paths
const path_constants = require('./constantsPaths');

//Libraries
const bcrypt = require('bcrypt');


//Models
const Client  = require("./Schemas/Client");
const Warehouse  = require("./Schemas/Warehouse");
const Item  = require("./Schemas/Item");

//function checkAccessRigts(req, data ,res){
function checkAccessRigts(req){
    try{
        var file_path = ""
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
            return true;
        }

        return page_user_type == req.user.type
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
  
    console.log("User " + text + "Created");
    console.log("-----------------------");
  
    return user;
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
            price_r :price_r
        });
        

        if(price_w == ""){
            item.price_w = price_r;
        }
        if(price_w != ""){
            item.discount_r = discount_r;
        }
        if(price_w != ""){
            item.discount_w = discount_w;
        }

        console.log("item created");
        
        return item;
    }
    catch(e){
        console.log(e)
    }
}


module.exports = { checkAccessRigts, createWarehouse, createItem, create_user};
