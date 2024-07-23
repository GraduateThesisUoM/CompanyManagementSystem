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
const Item = require(path_constants.schemas.two.item);




//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------   ADMIN - USER PROFILE*/
router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        if(generalFunctions.checkAccessRigts(req,res)){
            var compnay = "";
            if(req.user.type != 'admin'){
                compnay = req.user.company
            }
            var list_items = [];
            var column_titles = [];
            if(req.query.searchfor == "companys"){
                list_items = await Company.find();
                list_items = list_items.map(item => ({
                    data :[ item.name, formatDate(item.registrationDate), item.status]
                }));
                column_titles = ["Name", "Reg Date","Status"]
            }
            else if (req.query.searchfor == "users"){
                list_items = await User.find();
                list_items = list_items.map(item => ({
                    data :[ item.firstName,item.lastName, formatDate(item.registrationDate), item.account_status]
                }));
                column_titles = ["First Name","Last Name","Reg Date","Status"]
            }
            else if (req.query.searchfor == "items"){
                list_items = await Item.find({companyID : compnay});

                console.log(list_items)
                list_items = list_items.map(item => ({
                    data :[ item.title,item.description, formatDate(item.registrationDate), item.active, item.price_r, item.price_w, item.discount_r, item.discount_w]
                }));
                column_titles = ["Title","Description","Reg Date","Status","Prece Retail","Discount Retail","Prece Wholesale","Discount Wholesale"]

            }
            
            var data = {
                user: req.user,
                list_items : list_items,
                notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}),
                column_titles : column_titles
            };
            res.render(path_constants.pages.list.view(), data)
          }
          else{
            res.redirect('/error?origin_page=my-company&error=acces denid');
          }
    }
    catch (err) {
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page=list&error=' + err);
    }
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};



module.exports = router;