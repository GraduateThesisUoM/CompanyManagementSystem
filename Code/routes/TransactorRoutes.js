const express = require("express");
const router = express.Router();

//Models
const Transactor  = require("../Schemas/Transactor");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

router.get("/", Authentication.checkAuthenticated, async (req, res) => {
    try{
        var transactor_list = await Transactor.find({type: req.query.type});
        console.log(req.query.type);
        res.render('../views/general/transactor_page.ejs', {transactor_list: transactor_list, transactor_type: req.query.type});

    }catch(err){
        console.error('Error loading transactor list:', err);
        res.redirect('/error?origin_page=transactor/list&error=' + err);
    }
});

/*--------  CREATE TRANSACTOR */
router.post('/save', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      // check if a transactor with the same code or amf exists
    const code_check = await Transactor.findOne({$and: [{code: req.body.transactor_code}, {type: req.query.type}]});
    const afm_check = await Transactor.findOne({$and: [{afm: req.body.transactor_AFM}, {type: req.query.type}]});
    console.log(code_check, afm_check);

    // if not
    if((code_check == null) && (afm_check == null)){
        var tcode = req.body.transactor_code;
        var tname = req.body.transactor_name;
        var tafm = req.body.transactor_AFM;
        if(req.body.transactor_occupation != null){var toccupation = req.body.transactor_occupation;}else{var toccupation = " ";}
        if(req.body.transactor_address != null){var taddress = req.body.transactor_address;}else{var taddress = " ";}
        if(req.body.transactor_district != null){var tdistrict = req.body.transactor_district;}else{var tdistrict = " ";}
        if(req.body.transactor_city != null){var tcity = req.body.transactor_city;}else{var tcity = " ";}
        if(req.body.transactor_country != null){var tcountry = req.body.transactor_country;}else{var tcountry = " ";}
        if(req.body.transactor_zip != null){var tzip = req.body.transactor_zip;}else{var tzip = "";}
        if(req.body.transactor_phone1 != null){var tphone1 = req.body.transactor_phone1;}else{var tphone1 = " ";}
        if(req.body.transactor_shipping_address != null){var tshipping_address = req.body.transactor_shipping_address;}else{var tshipping_address = " ";}
        if(req.body.transactor_shipping_city != null){var tshipping_city = req.body.transactor_shipping_city;}else{var tshipping_city = " ";}
        if(req.body.transactor_shipping_country != null){var tshipping_country = req.body.transactor_shipping_country;}else{var tshipping_country = " ";}
        if(req.body.transactor_shipping_zip != null){var tshipping_zip = req.body.transactor_shipping_zip;}else{var tshipping_zip = " ";}
        const newTransactor = new Transactor({ //Transactor constructor
            code: tcode,
            name: tname,
            afm: tafm,
            occupation: toccupation,
            address: taddress,
            district: tdistrict,
            city: tcity,
            country: tcountry,
            zip: tzip,
            phone1: tphone1,
            //phone2: "123",
            type: req.query.type,
            shipping_address: tshipping_address,
            //shipping_district: "test", 
            shipping_city: tshipping_city, 
            shipping_country: tshipping_country, 
            shipping_zip: tshipping_zip
        });
        await newTransactor.save();
    }
    else if((code_check != null) && (afm_check == null)){
        //window.alert({content: "Ο κωδικός δεν είναι μοναδικός!"});
    }
    else{
        //window.alert({content: "Το ΑΦΜ δεν είναι μοναδικό!"});
    }
    res.redirect('back');
    }
    catch (err) {
      console.error('Error creating transactor:', err);
      res.redirect('/error?origin_page=transactor/save&error=' + err);
    }
});




module.exports = router;