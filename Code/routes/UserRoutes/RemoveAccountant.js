const express = require("express");
const router = express.Router();

//Models
const Client = require("../../Schemas/Client");
const Accountant = require("../../Schemas/Accountant");
const Company = require("../../Schemas/Company");

const create_notification = require("../../CreateNotification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
const clientAccountantFunctions = require("../../ClientAccountantFunctions");


router.post('/', Authentication.checkAuthenticated, async (req, res) => {

    const company = await Company.findOne({_id:req.user.company});

    clientAccountantFunctions.fire_accountant(company._id,req.user._id,req.body.accountant_id);
    console.log("Accountant removed")

    //await Client.updateOne({_id: req.user._id}, {$set: {"myaccountant.status": "not_assigned", "myaccountant.id": "not_assigned"}});
    //await Accountant.updateOne({_id: req.user.myaccountant.id}, {$pull: {clients: {id: req.user._id}}});
    //create_notification(req.user.myaccountant.id, req.user._id, "firing-accountant-notification");
    res.redirect("/my-accountant")
});

module.exports = router;
