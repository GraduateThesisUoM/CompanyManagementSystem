const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');


//Models
const Company  = require(path_constants.schemas.two.company);
const Accountant  = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Report = require(path_constants.schemas.two.report);
const User = require(path_constants.schemas.two.user);
const Person = require(path_constants.schemas.two.person);


//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        var person = "";
        if(req.query.type=="buy"){
            person = "supplier"
        }
        else{
            person = "customer"
        }
        list_items = await Person.find({company: req.user.company,type:person});
        console.log(list_items);
        list_items = list_items.map(item => ({
            id:item._id,
            firstName:item.firstName,
            lastName:item.lastName
        }));
        console.log(list_items);

        var data = {
            user: req.user,
            persons:list_items,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
        };
        res.render(path_constants.pages.create_doc.view(), data);
    }
    catch(e){
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page='+path_constants.create_doc.url+'&error=' + err);
    }
});

module.exports = router;
