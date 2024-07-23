const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const constants = require('../../constantsPaths');


/*--------   Create */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        if(generalFunctions.checkAccessRigts(req)){
            if(req.user.type == 'admin' && req.session.selected_client == undefined){
                res.redirect('/clients');
            }
            else{
                const data = {
                    user : req.user,
                    companyId : req.user.company,
                    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
                };
                if(req.user.type == 'admin'){
                    data.clientId = req.session.selected_client._id;
                }
                res.render(constants.pages.create.view(),data);
            }
        }
        else{
            res.redirect('/error?origin_page=/&error='+constants.url_param.param_1);
        }
    }
    catch(e){
        console.error('Error on create page:', e);
        res.redirect('/error?origin_page=/&error='+e);
    }
    
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        var company = "";
        if(req.user.type == 'admin'){
            company = req.session.selected_client._id;
        }
        else{
            company = req.user.company;
        }
        console.log(req.body.create_type);
        if(req.body.create_type == 'warehouse'){
            const warehouse = await generalFunctions.createWarehouse(company, req.body.warehouse_title,req.body.warehouse_address);
            console.log(warehouse);
        }
        else if(req.body.create_type == 'item'){
            const item = await generalFunctions.createItem(company, req.body.item_title,req.body.item_description,req.body.item_price_r,req.body.item_price_r_disc,req.body.item_price_w,req.body.item_price_w_disc);
            console.log(item);
        }
        else if(req.body.create_type == 'series'){
            const series = await generalFunctions.createSeries(company, req.body.series_title);
            console.log(series);
        }
        else if(req.body.create_type == 'person'){
            const person = await generalFunctions.create_person(req.body.person_firstName,req.body.person_lastName,req.body.person_email,req.body.person_vat,
                req.body.person_phone,req.user.company)
            console.log(person);
        }
        res.redirect('/create');
    }
    catch(e){
        console.error('** ' +e+" **");
        res.redirect('/error?origin_page=create&error='+e);
    }
});

module.exports = router;