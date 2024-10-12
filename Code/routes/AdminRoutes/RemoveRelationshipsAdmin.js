const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../../Schemas/Accountant");
const Client  = require("../../Schemas/Client");
const clientAccountantFunctions = require("../../ClientAccountantFunctions");


//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
const create_notification = require("../../CreateNotification");

/*--------   ADMIN - REMOVE RELATIONSHIPS */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      clientAccountantFunctions.fire_accountant(req.query.id_company, req.user._id, req.query.id_acc);
      //create_notification(req.query.id_user, req.query.id_acc, "admin-relationship-sever-user");
      //create_notification(req.query.id_acc, req.query.id_user, "admin-relationship-sever-acc");
      res.redirect('/');
    }
    catch (err) {
      console.error('Error deleting relationship:', err);
      res.redirect('/error?origin_page=remove-relationship&error=' + err);
    }
});

module.exports = router;