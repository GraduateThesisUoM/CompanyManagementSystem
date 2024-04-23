express = require("express");
//Models
const Accountant  = require("./Schemas/Accountant");
const Company  = require("./Schemas/Company");
const Node = require("./Schemas/Node");
const Client  = require("./Schemas/Client");

async function send_hiring_req_to_accountant(companyId,senderId, accountantId){
    // check if a notification of the same type exists for user
    /*const client_company = await Client.findOne({_id:userId});
    const client_company = await Company.findOne({_id:companyId});*/
    try{
        console.log("enter send_hiring_req_to_accountant");
        const company = await Company.findOne({_id:companyId});

        if(company.accountant != "not_assigned"){
            console.log('send_hiring_req_to_accountant has accountant')
            const company_nodes = await Node.find({company_id:company._id,type:"request",status: { $in: ['viewed', 'pending'] }});

        
            const last_accountant_node = await Node.find({company_id:company._id,type:"hiring",status: 'executed'});
            last_accountant_node.status = 'canceled';
            await last_accountant_node.save();

            company_nodes.forEach(async node => {
                node.next = company_node;
                node.status = 'canceled';
                await node.save();
            });
        }
        else{
            console.log('send_hiring_req_to_accountant has no accountant')
        }

        const company_node = new Node({
            company_id: company._id,
            sender_id: senderId,
            receiver_id:accountantId,
            type: 'relationship',
            type2: 'hiring'
        });

        if(company_node.company_id == company_node.receiver_id){
            company_node.status = 'executed';
        }

        await company_node.save();
        company.accountant = company_node._id;
        await company.save();


        console.log("Hiring Node Created");
    }
    catch(e){
        console.log(e)
    }
}

async function fire_accountant(companyId,senderId,receiverId){
    try{
        const company = await Company.findOne({_id:companyId});
        const company_node = await Node.findOne({_id:company.accountant});
        const new_company_node = new Node({
            company_id: company._id,
            sender_id: senderId,
            receiver_id:receiverId,
            type: 'relationship',
            type2: 'firing',
            status: 'executed'
        });

        await new_company_node.save();

        company.accountant = new_company_node._id;
        await company.save();

        company_node.next = new_company_node._id;
        await company_node.save();

        const company_nodes = await Node.find({company_id:company._id,type:"request",status: { $in: ['viewed', 'pending'] }});

        company_nodes.forEach(async node => {
            node.next = company_node._id;
            node.status = 'canceled';
            await node.save();
        });
        console.log("Accountant Fired Succesfully");
    }
    catch(e){
        console.log(e)
    }
}

async function fetchClients(accountantId,select){
    try{
        var clients = [];
        var clients_Nodes;
        if(select == 'all'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'hiring', status: { $in: ['executed','pending', 'rejected'] } });
            
        }
        else{
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'hiring', status: select });
        }

        for (let client of clients_Nodes) {
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
        const client = await Node.find({receiver_id:accountantId,company_id:clientId, type:'hiring', status: 'pending' });
        return client;

    }
    catch(e){
        console.log(e)
    }

}

module.exports = { send_hiring_req_to_accountant, fire_accountant, fetchOneClient,  fetchClients};

