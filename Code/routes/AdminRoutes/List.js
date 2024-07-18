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



//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------   ADMIN - USER PROFILE*/
router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        if(generalFunctions.checkAccessRigts(req,res)){
            var list_items = [];
            if(req.query.searchfor == "companys"){
                list_items = await Company.find();
                list_items = list_items.map(item => ({
                    name: item.name,
                    status: item.status,
                    registrationDate: formatDate(item.registrationDate)
                }));
            }
            else if (req.query.searchfor == "users"){
                list_items = await User.find();
                list_items = list_items.map(item => ({
                    name: item.firstName,
                    status: item.account_status,
                    registrationDate: formatDate(item.registrationDate)
                }));
            }
            
            var data = {
                user: req.user,
                list_items : list_items
            };
            res.render('admin_pages/list.ejs', data)
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