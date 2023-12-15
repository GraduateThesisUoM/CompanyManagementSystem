const express = require("express");
const router = express.Router();

//Models
const Client = require("../Schemas/Client");
const Accountant = require("../Schemas/Accountant");
const create_notification = require("../CreateNotification");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    console.log(req.user);
    await Client.updateOne({_id: req.user._id}, {$set: {"myaccountant.status": "not_assigned", "myaccountant.id": "not_assigned"}});
    await Accountant.updateOne({_id: req.user.myaccountant.id}, {$pull: {clients: {id: req.user._id}}});
    create_notification(req.user.myaccountant.id, req.user._id, "firing-accountant-notification");
    res.redirect("/my-accountant")
});

module.exports = router;
