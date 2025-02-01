express = require("express");
const path_constants = require('././constantsPaths');

//Models
const Accountant  = require(path_constants.schemas.one.accountant);
const Company  = require(path_constants.schemas.one.company);
const Node  = require(path_constants.schemas.one.node);


const generalFunctions = require(path_constants.generalFunctions_folder.one);



async function send_hiring_req_to_accountant(companyId,senderId, accountantId){
    try{
        const company = await Company.findOne({_id:companyId});

        var last_accountant_node = await Node.findOne({company:company._id,type2:1,status: { $in: [2, 1, 3] }});
        
        console.log("fffffffffffffffffffff")
        const company_node = await generalFunctions.create_node({
            company : company._id,
            sender_id : senderId,
            receiver_id : accountantId,
            type : 1,
            type2 : 3});


        if(last_accountant_node == null){
            console.log('send_hiring_req_to_accountant has no accountant')
        }
        else{
            
            const company_nodes = await Node.find({company:company._id,type2:4,status: { $in: [1,3] }});

            last_accountant_node.next = company_node._id;
            last_accountant_node.status = 5;
            await last_accountant_node.save();

            company_nodes.forEach(async node => {
                node.next = company_node._id;
                node.status = 'canceled';
                await node.save();
            });
        }

        console.log("Hiring Node Created");
    }
    catch(e){
        console.log(e)
    }
}

async function cancel_hiring_req_to_accountant(companyId, accountantId){
    try{
        const company_node = await Node.findOne({company:companyId,type:1,next:'-'});

        company_node.status = 5;//canceled
        company_node.locked = 1;
        await company_node.save();

        console.log("Request to Accountant Canceled");
    }
    catch(e){
        console.log(e)
    }
}


async function fire_accountant(companyId,senderId,accountantId){
    try{
        const company = await Company.findOne({_id:companyId});
        const company_node = await Node.findOne({_id:company.accountant});
        //const new_company_node = await generalFunctions.create_node(company._id,senderId,accountantId,'relationship','firing');
            
        const new_company_node = await  generalFunctions.node_reply({
            target_node : company_node,
            type2: 2,
        });

        //company_node.next = new_company_node._id;
        company_node.status = 5;//canceled
        company_node.locked = 1;

        await company_node.save();

        const company_nodes = await Node.find({company:company._id,type:3,status: { $in: [1,3] }});

        company_nodes.forEach(async node => {
            node.next = company_node._id;
            node.status = 5;//canceled
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
        console.log('fetchClients')
        var clients = [];
        var clients_Nodes;
        var nodes

        if(select == 'all'){
            nodes = await Node.find({receiver_id:accountantId, type:1,type2:3, status:2 ,next:'-' });
            for(node of nodes){
                clients.push(await Company.findOne({_id:node.company}))
            }
        }
        else if(select == 'fired'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:1,type2:3, status: 2, next: { $exists: false }  });
        }
        else if(select == 'curent'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:1,type2:3, status: 2, next: { $exists: false }  });
        }

        /*for (let client of clients_Nodes) {
            clients.push(await Company.findOne({_id:client.company}));
          }*/
        return clients;
        
    }
    catch(e){
        console.log(e)
    }
    
}

async function fetchOneClient(accountantId,clientId){
    try{
        const client = await Node.find({receiver_id:accountantId,company:clientId, type:1,type2:1, status: 2 });
        return client;

    }
    catch(e){
        console.log(e)
    }

}

module.exports = {
    send_hiring_req_to_accountant,
    fire_accountant, fetchOneClient,
    fetchClients,
    cancel_hiring_req_to_accountant,
};

