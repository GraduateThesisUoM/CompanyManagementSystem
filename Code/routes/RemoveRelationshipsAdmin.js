const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../Schemas/Accountant");
const Client  = require("../Schemas/Client");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   ADMIN - REMOVE RELATIONSHIPS */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      //update client
      await Client.updateOne({_id: req.query.id_user}, {$set: {"myaccountant.status": "not_assigned", "myaccountant.id": "not_assigned"}});
  
      //update accountant
      await Accountant.updateOne({_id: req.query.id_acc}, {$pull: {clients: {id: req.query.id_user}}});
      res.redirect('back');
    }
    catch (err) {
      console.error('Error deleting relationship:', err);
      res.redirect('/error?origin_page=remove-relationship&error=' + err);
    }
});

module.exports = router;