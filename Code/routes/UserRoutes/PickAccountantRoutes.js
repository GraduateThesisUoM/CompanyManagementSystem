const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two)
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);


/*--------   PICK ACCOUNTANT */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("PickAccoutnantRoutes")
    const access = generalFunctions.checkAccessRigts(req,res);
    if(access.response){
      const accountants = await Accountant.find({}); // Fetch all accountants from the database
      accountants.sort((a, b) => a.firstName.localeCompare(b.firstName));
      const company = await Company.findOne({_id:req.user.company});

      var company_node = await Node.findOne({company:company._id,next:'-',status:2,type:1,type2:3})
      ;
      if (company_node == null){
        company_node = {
          company: '-',
          receiver_id : '-'
        }
      }
  
      const accountants_with_ratings = []
  
      for (const accountant of accountants){
        var average_rating = 0
      
        const reviews = await Review.find({reviewed_id: accountant._id, type: 1});
  
        for (const review of reviews){
          average_rating = average_rating + review.rating;
        }
        if(reviews.length > 0){
          accountants_with_ratings.push({
            accountant: accountant ,
            average_rating: (average_rating / reviews.length).toFixed(1)
          })
        }
        else{
          accountants_with_ratings.push({
            accountant: accountant ,
            average_rating: "-"
          })
        }
        
      }


  
      res.render('user_pages/pick_accountant.ejs', {
        user: req.user,
        company:company,
        company_node:company_node,
        accountants: accountants_with_ratings,
        });

    }
    else{
      res.redirect('/error?error='+access.error);
    }
    } catch (err) {
      console.error('Error fetching accountants:', err);
      res.redirect('/error?error=' + err);
    }
});
  
router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if(req.body.accountant_id == 'self-accountant'){
        console.log("Pick Accountnant Post Self - accountnat")
        //const company = await Company.findOne({_id:req.user.company});
        await clientAccountantFunctions.send_hiring_req_to_accountant(
          req.user.company,
          req.user._id,
          req.user.company
        );
        res.redirect("/my-accountant")
      }
      else{
        const accountant = await Accountant.findOne({_id:req.body.accountant_id});
        req.session.accountant = accountant;
        console.log("PickAccountantRoutes "+req.session.accountant );
        res.redirect('/preview-accountant');
      }
      
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=pick-accountant&error='+err);
    }
});

module.exports = router;
  