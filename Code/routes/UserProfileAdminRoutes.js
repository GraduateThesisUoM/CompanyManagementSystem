const express = require("express");
const router = express.Router();

//Models
const Report = require("../Schemas/Report");
const Review  = require("../Schemas/Review");
const User = require("../Schemas/User");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");


/*--------   ADMIN - USER PROFILE*/
router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        res.render('admin_pages/user_info_page.ejs', {user: req.user ,user_profile : await User.findOne({_id: req.query.id}), 
        reports_for_user: await Report.find({$and:[{reported_id: req.query.id}, {reporter_id: {$ne:req.query.id}}, {status: "pending"}]}),
        reports_by_user: await Report.find({$and:[{reporter_id: req.query.id}, {reported_id: {$ne:req.query.id}}, {status: "pending"}]}),
        reviews_for_user: await Review.find({reviewed_id: req.query.id}),
        user_list: await User.find(),
        general_reports: await Report.find({$and:[{reporter_id: req.query.id}, {reported_id: req.query.id}]})})
    }
    catch (err) {
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page=user-profile&error=' + err);
    }
});

module.exports = router;