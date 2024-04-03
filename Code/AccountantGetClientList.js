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
            
        }
        else{
            clients_requests = await Request.find({receiver_id:accountantId, type:'hiring', status: select });
        }

        for (let client of clients_requests) {
            clients.push(await Company.findOne({_id:client.company_id}));
          }
          return clients;
        
    }
    catch(e){
        console.log(e)
    }
    
}

async function fetchOneClient(accountantId,clientId){
    try{
        const client = await Request.find({receiver_id:accountantId,company_id:clientId, type:'hiring', status: 'pending' });
        return client;

    }
    catch(e){
        console.log(e)
    }

}


module.exports = {fetchClients, fetchOneClient};

