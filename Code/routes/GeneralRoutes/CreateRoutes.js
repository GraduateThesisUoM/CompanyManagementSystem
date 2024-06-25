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
        if (req.session.selected_client != undefined) {
            if(generalFunctions.checkAccessRigts(req)){
                const data = {
                    user : req.user,
                    clientId : req.session.selected_client._id,
                    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
                };
                res.render(constants.pages.create.view(),data);
            }
            else{
                res.redirect('/error?origin_page=/&error='+constants.url_param.param_1);
            }
        }
        else{
            res.redirect('/clients');
        }
    }
    catch(e){
        console.error('Error on create page:', e);
        res.redirect('/error?origin_page=/&error='+e);
    }
    
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        console.log(req.body.create_type);
        if(req.body.create_type == 'warehouse'){
            const warehouse = await generalFunctions.createWarehouse(req.session.selected_client._id, req.body.warehouse_title,req.body.warehouse_address);
            console.log(warehouse);
        }
        else if(req.body.create_type == 'item'){
            const item = await generalFunctions.createItem(req.session.selected_client._id, req.body.item_title,req.body.item_description,req.body.item_price_r,req.body.item_price_r_disc,req.body.item_price_w,req.body.item_price_w_disc);
            console.log(item);
        }
        else if(req.body.create_type == 'series'){
            const series = await generalFunctions.createSeries(req.session.selected_client._id, req.body.series_title);
            console.log(series);
        }
        res.redirect('/create');
    }
    catch(e){
        console.error('** ' +e+" **");
        res.redirect('/error?origin_page=create&error='+e);
    }
});

module.exports = router;