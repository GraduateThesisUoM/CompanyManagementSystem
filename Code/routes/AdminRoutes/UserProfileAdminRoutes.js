const express = require("express");
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;

//Models
const Report = require("../../Schemas/Report");
const Review  = require("../../Schemas/Review");
const User = require("../../Schemas/User");
const Company = require("../../Schemas/Company");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");


/*--------   ADMIN - USER PROFILE*/
router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{

        var target_user = await User.findOne({_id: req.query.id}); 
        var list_of_clients = [];
        var target_company;
       
        if(target_user.type == "accountant"){ // check if target user is an accountant so we can pass client list as a parameter
            var list_of_clients = await Company.find({accountant: req.query.id});
        }
        else if(target_user.type == "user"){ // check if target user is an accountant so we can pass client list as a parameter
            var target_company = await Company.find({_id: target_user.company});
        }
            
            res.render('admin_pages/user_info_page.ejs', {user: req.user ,target_user : await User.findOne({_id: req.query.id}),
            target_company: target_company,
            reports_for_user: await Report.find({$and:[{reported_id: req.query.id}, {reporter_id: {$ne:req.query.id}}, {status: "pending"}]}),
            reports_by_user: await Report.find({$and:[{reporter_id: req.query.id}, {reported_id: {$ne:req.query.id}}, {status: "pending"}]}),
            reviews_for_user: await Review.find({reviewed_id: req.query.id}),
            user_list: await User.find(),
            company_list: await Company.find(),
            general_reports: await Report.find({$and:[{reporter_id: req.query.id}, {reported_id: req.query.id}]}), 
            list_of_clients});
        
    }
    catch (err) {
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page=user-profile&error=' + err);
    }
});

module.exports = router;