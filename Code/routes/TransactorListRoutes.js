const express = require("express");
const router = express.Router();

//Models
const Transactor  = require("../Schemas/Transactor");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

router.get("/", Authentication.checkAuthenticated, async (req, res) => {
    try{
        var transactor_list = await Transactor.find({type:req.query.type});
        res.render('../views/general/transactor_list.ejs', {transactor_list: transactor_list, transactor_type: req.query.type});

    }catch(err){
        console.error('Error loading transactor list:', err);
        res.redirect('/error?origin_page=transactor/list&error=' + err);
    }
});

module.exports = router;