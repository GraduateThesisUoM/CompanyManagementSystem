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
const Series = require(path_constants.schemas.two.series);



//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        let person = req.query.type === "buy" ? "supplier" : "customer";

        var list_persons = await Person.find({company: req.user.company,type:person,account_status: 'active'});
        list_persons = list_persons.map(item => ({
            id:item._id,
            firstName:item.firstName,
            lastName:item.lastName
        }));

        var list_items = await Item.find({companyID: req.user.company,active:1});

        var list_series = await Series.find({companyID: req.user.company,active:1,type:req.query.type});

        var data = {
            user: req.user,
            persons:list_persons,
            items:list_items,
            series:list_series,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
        };
        res.render(path_constants.pages.create_doc.view(), data);
    }
    catch(e){
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page=/create?type='+req.body.doc_type+'&error=' + encodeURIComponent(e.message));
    }
});

router.post('/', async (req, res) => {
    try {
        const lines_of_doc = {};
        for (let i = 0; i < req.body.num_of_rows; i++) {
            const quontity = req.body[`quontity_${i}`];
            const tax = req.body[`tax_${i}`];
            const lineItem = req.body[`doc_line_item_${i}`];
            const discount = req.body[`discount_${i}`];
            const price_of_unit = req.body[`price_of_unit_${i}`];
            lines_of_doc[i] = { quontity,tax, lineItem,discount,price_of_unit};
        }
        const data = {
            company: req.user.company,
            sender: req.user._id,
            receiver: req.body.customer_id,
            type: req.body.doc_type,
            series: req.body.doc_series,
            generalDiscount: req.body.general_discount,
            invoiceData: lines_of_doc
        }

        var doc = generalFunctions.create_doc(data);


        res.redirect('/create-doc?type='+req.body.doc_type);
    } catch (e) {
        console.error(e);
        res.redirect('/error?origin_page=create-doc&error=' + encodeURIComponent(e.message));
    }
});


module.exports = router;
