express = require("express");
const Transactor = require("./Schemas/Transactor");

let alert = require('alert');

async function create_transactor(code, name, occupation, address, district, city, country, zip, phone1, phone2, afm, type, 
    shipping_address, shipping_city, shipping_country, shipping_zip){
    // check if a transactor with the same code or amf exists
    var code_check = await Transactor.findOne({$and: [{code: code}, {type: type}]});
    var afm_check = await Transactor.findOne({$and: [{afm: afm}, {type: type}]});

    // if not
    if((code_check == null) && (afm_check == null)){
        const newTransactor = new Transactor({ //Transactor constructor
            code: code,
            name: name,
            occupation: occupation,
            address: address,
            district: district,
            city: city,
            country: country,
            zip: zip,
            phone1: phone1,
            phone2: phone2,
            afm: afm,
            type: type,
            shipping_address: shipping_address, 
            shipping_city: shipping_city, 
            shipping_country: shipping_country, 
            shipping_zip: shipping_zip
        });
        await newTransactor.save();
    }
    else if((code_check != null) && (afm_check == null)){
        alert("Ο κωδικός δεν είναι μοναδικός!");
    }
    else if((code_check == null) && (afm_check != null)){
        alert("Το ΑΦΜ δεν είναι μοναδικό!");
    }
}

module.exports = create_transactor;