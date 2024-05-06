const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();

//Models
const User = require("../../Schemas/User");
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const path_constants = require('../../constantsPaths');


/*--------   Create */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        if(generalFunctions.checkAccessRigts(req))
            {
            const data = {
                user : req.user,
                clientId : req.session.selected_client._id,
                notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
            };
            res.render(path_constants.pages.create.view(),data);
        }
        else{
            res.redirect('/error?origin_page=/&error='+path_constants.url_param.param_1);
          }
    }
    catch(e){
        console.error('Error on create page:', err);
        res.redirect('/error?origin_page=create&error='+err);
    }
    
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    console.log(req.body.create_type);
    res.redirect('/create');

});

module.exports = router;