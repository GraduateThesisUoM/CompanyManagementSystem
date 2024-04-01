express = require("express");
//Models
//const Accountant  = require("./Schemas/Accountant");
//const Company  = require("./Schemas/Company");
//const Client  = require("./Schemas/Client");
const Request = require("./Schemas/Request");


async function accountant_get_client_list(accountantId,select){
    
    try{
        if(select == 'all'){
            const clients = await Request.find({receiver_id:accountantId, type:'hiring', status: { $in: ['executed','pending', 'rejected'] } });
            return clients
        }
        else {
            const clients = await Request.find({receiver_id:accountantId, type:'hiring', status: select });
            return clients
        }
    }
    catch(e){
        console.log(e)
        return [];
    }
}

module.exports = accountant_get_client_list;

