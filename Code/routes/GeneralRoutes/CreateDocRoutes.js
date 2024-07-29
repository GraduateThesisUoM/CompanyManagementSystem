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
const Item = require(path_constants.schemas.two.item);


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
        var list_persons = await Person.find({company: req.user.company,type:person,account_status: 'active'});
        list_persons = list_persons.map(item => ({
            id:item._id,
            firstName:item.firstName,
            lastName:item.lastName
        }));

        var list_items = await Item.find({companyID: req.user.company,active:1});


        var data = {
            user: req.user,
            persons:list_persons,
            items:list_items,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
        };
        res.render(path_constants.pages.create_doc.view(), data);
    }
    catch(e){
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page='+path_constants.create_doc.url+'&error=' + err);
    }
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {

    try {
        // Log each form field individually
        console.log('Document Type:', req.body.doc_type);
        console.log('Document Date:', req.body.doc_date);
        console.log('Customer ID:', req.body.customer_id);
        console.log('Wholesale/Retail:', req.body.wholesale_retail);
        console.log('General Discount:', req.body.general_discount);
        console.log('Number of Rows:', req.body.num_of_rows);

        let tableData = [];
        if (Array.isArray(req.body.item_title)) {
            req.body.item_title.forEach((title, index) => {
                let row = [
                    title,
                    req.body.item_quantity[index],
                    req.body.item_tax[index],
                    req.body.item_discount[index],
                    req.body.item_price_of_unit[index],
                    req.body.item_total_price[index]
                ];
                tableData.push(row);
            });
        }

        console.log('Table Data:', tableData);

        res.redirect('/create?type='+req.body.doc_type);
    } catch (e) {
        console.error(e);
        res.redirect('/error?origin_page=create&error=' + encodeURIComponent(e.message));
    }
});


module.exports = router;
