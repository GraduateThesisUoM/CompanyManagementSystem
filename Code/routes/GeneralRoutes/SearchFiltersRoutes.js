const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");
const Item = require("../../Schemas/Item");
const Warehouse = require("../../Schemas/Warehouse");



//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const constants = require('../../constantsPaths');


router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        if (req.session.selected_client != undefined) {
            if(generalFunctions.checkAccessRigts(req)){
                const data = {
                    user : req.user,
                    clientId : req.session.selected_client._id,
                    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
                };
                
                res.render(constants.pages.filters.view(),data);
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

router.post('/', async (req, res) => {
    try{
        if(req.body.fileter_type_input == 'fileter_type_warehouse'){
            var fromdate = "";
            var todate = "";
            var activeStatuses = [1,0];
            var dates = {};

            //Active -1,0,1
            if(req.body.filter_active_value == 1){
                activeStatuses = [1];
            }
            else if(req.body.filter_active_value == 0){
                activeStatuses = [0];
            }

            //Reg Date
            if (req.body.filter_reg_date_from != ""){
                fromdate = new Date(req.body.filter_reg_date_from);
                dates.registrationDate = { $gte: fromdate };
            }
            /*if (req.body.filter_reg_date_to != ""){
                todate = new Date(req.body.filter_reg_date_to);
                dates.createdAt.$lte = todate;
            }*/

            var query = { 
                active: { $in: activeStatuses },
                dates
            };
            var active = await Warehouse.find({active: { $in: activeStatuses }, registrationDate:{$gte: fromdate}});
            console.log(active);

        }
        /*else if(req.body.fileter_type_input == 'fileter_type_item'){

        }*/

        res.redirect('/search-filters'); // Redirect to the GET route
    }
    catch(e){
        console.error('Error on create page:', e);
        res.redirect('/error?origin_page=/&error='+e);
    }
});

module.exports = router;