const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

//Models
const Company  = require(path_constants.schemas.two.company);
const Accountant  = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Report = require(path_constants.schemas.two.report);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);

router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        if(generalFunctions.checkAccessRigts(req,res)){
            var data = {
                user: req.user,
                data : req.user,
                notification_list: await Notification.find({$and:[{user_id: req.user._id} , {status: "unread"}]})
            };
            console.log(data.data.firstName)
            res.render(path_constants.pages.view.view(), data);
        }
        else{
          res.redirect('/error?origin_page=my-company&error=acces denid');
        }
    }catch (err) {
        console.error('Error saving user:', err);
        res.redirect('/error?origin_page=view&error='+err);
      }

    });




module.exports = router;