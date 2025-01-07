const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Client = require(path_constants.schemas.two.client);
const Salary = require(path_constants.schemas.two.salary);



//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two)
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);

router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        const access = generalFunctions.checkAccessRigts(req,res);
        if(access.response){
            console.log("PayRoll")
            const clients = await clientAccountantFunctions.fetchClients(req.user._id,'all');
            var comp = clients[0]._id;
            if( req.query.comp){
                comp = req.query.comp
            }
            const clients_users = [];
            var users = await Client.find({company: comp, status:1})

            for( u of users){
                clients_users.push({u : u , c : comp})
            }

            var selected_user = clients_users[0].u;
            if( req.query.id){
                selected_user = await Client.findOne({_id: req.query.id, status:1})
            }
            else if( req.query.comp){
                comp = req.query.comp
                selected_user = await Client.findOne({company:comp,type:'user', status:1})
            }
           

            var data ={
                user : req.user,
                clients : clients,
                clients_users: clients_users,
                selected_user : selected_user,
                time_in_comp : generalFunctions.calculateDateDifference(selected_user.registrationDate)
            }
            res.render( path_constants.pages.payroll.view(),data );  
        }
        else{
            res.redirect('/error?error='+access.error);
        }
    }
    catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?error='+err);
    }
})


router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      console.log("Post Payroll")
      const u = await Client.findOne({_id:req.body.person_select})
      console.log(u)
      const s = await new Salary({
        company : u.company,
        user : u._id,
        amount : 0.0
      })
      await s.save();
      res.redirect('/payroll');
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=payroll&error='+err);
    }
});

module.exports = router;