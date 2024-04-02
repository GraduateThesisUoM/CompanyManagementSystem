express = require("express");
//Models
//const Accountant  = require("./Schemas/Accountant");
//const Client  = require("./Schemas/Client");
const Company  = require("./Schemas/Company");
const Request = require("./Schemas/Request");


async function fetchClients(accountantId,select){
    try{
        var clients = [];
        var clients_requests;
        if(select == 'all'){
            clients_requests = await Request.find({receiver_id:accountantId, type:'hiring', status: { $in: ['executed','pending', 'rejected'] } });
            return clients_requests;
        }
        
    }
    catch(e){
        console.log(e)
    }
    
}

module.exports = {fetchClients};

