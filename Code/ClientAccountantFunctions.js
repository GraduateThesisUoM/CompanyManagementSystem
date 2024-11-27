express = require("express");
const path_constants = require('././constantsPaths');

//Models
const Accountant  = require(path_constants.schemas.one.accountant);
const Company  = require(path_constants.schemas.one.company);
const Node  = require(path_constants.schemas.one.node);
const Notification  = require(path_constants.schemas.one.notification);


const generalFunctions = require(path_constants.generalFunctions_folder.one);



async function send_hiring_req_to_accountant(companyId,senderId, accountantId){
    // check if a notification of the same type exists for user
    try{
        const company = await Company.findOne({_id:companyId});

        var last_accountant_node = await Node.findOne({company:company._id,type2:"hiring",status: { $in: ['executed', 'viewed', 'pending'] }});
        
        console.log("fffffffffffffffffffff")
        const company_node = await generalFunctions.create_node({
            company : company._id,
            sender_id : senderId,
            receiver_id : accountantId,
            type : 'relationship',
            type2 : 'hiring'});


        if(last_accountant_node == null){
            console.log('send_hiring_req_to_accountant has no accountant')
        }
        else{
            
            const company_nodes = await Node.find({company:company._id,type2:"request",status: { $in: ['viewed', 'pending'] }});

            last_accountant_node.next = company_node._id;
            last_accountant_node.status = 'canceled';
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
        const company_node = await Node.findOne({company:companyId,type:'relationship',next:'-'});

        company_node.status = 'canceled';

        await company_node.save();

        const notification = await Notification.findOne({company:companyId,relevant_user_id:accountantId,type:'hiring-notification'})
        console.log(notification);
        notification.type = 'cancel-hiring-req-notification'
        await notification.save();
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
            reply: 'firing',
            text : ''
        });

        //company_node.next = new_company_node._id;
        company_node.status = 'canceled';

        await company_node.save();

        const company_nodes = await Node.find({company:company._id,type:"request",status: { $in: ['viewed', 'pending'] }});

        company_nodes.forEach(async node => {
            node.next = company_node._id;
            node.status = 'canceled';
            await node.save();
        });
        await generalFunctions.create_notification(senderId, accountantId, companyId, accountantId, 'firing-notification');

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
        var all_nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'hiring', status: { $in: ['executed','pending', 'rejected'] } });

        if(select == 'all'){
            //clients_Nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'hiring', status: { $in: ['executed','pending', 'rejected'] } });
            for(node of all_nodes){
                if(node.next != '-'){
                    let n  = await Node.findOne({_id:node.next});
                    if(n.status =='executed' && n.next == '-'){
                        clients.push(await Company.findOne({_id:n.company}))
                    }
                }
            }
        }
        else if(select == 'fired'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'firing', status: 'executed', next: { $exists: false }  });
        }
        else if(select == 'curent'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'hiring', status: 'executed', next: { $exists: false }  });
        }
        else{
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'hiring', status: select , next: { $exists: false }});
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
        const client = await Node.find({receiver_id:accountantId,company:clientId, type:'relationship',type2:'hiring', status: 'pending' });
        return client;

    }
    catch(e){
        console.log(e)
    }

}

async function relationship_accept_reject(companyId,action){
    try{
        const relationshipNode = await generalFunctions.get_accountant_node({company:companyId});
        relationshipNode.status = action;
        await relationshipNode.save();
        console.log(action+" done"); 
    }
    catch(e){
        console.log(e)
    }
}

module.exports = {
    send_hiring_req_to_accountant,
    fire_accountant, fetchOneClient,
    fetchClients, 
    relationship_accept_reject,cancel_hiring_req_to_accountant
};

