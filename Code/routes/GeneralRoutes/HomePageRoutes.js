const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

const User = require(path_constants.schemas.two.user);
const Node = require(path_constants.schemas.two.node);

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);


router.get('/', (req, res) => {
        res.render('.'+path_constants.pages.homepage.view());
});

router.post("/", Authentication.checkNotAuthenticated, async (req, res) => {
        try {
                const user = await User.findOne({_id : req.body.scan})
                var scan =await generalFunctions.record_scan({user : user})
                console.log(scan)
                /*var scan = req.body.scan
                console.log(scan);
                console.log(new Date())*/
                //var node = await Node.find
                res.redirect('/index?scan=true&action='+scan)
        }
        catch (err) {
                console.error("Error :", err);
                res.redirect("/error?error=" + err);
        }
});

module.exports = router;