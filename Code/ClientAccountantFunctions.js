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
        console.log(accountantId);

        var last_accountant_node = await Node.findOne({company_id:company._id,type2:"hiring",status: { $in: ['executed', 'viewed', 'pending'] }});
        
        console.log(last_accountant_node);
        console.log("fffffffffffffffffffff")
        const company_node = await generalFunctions.create_node({
            company_id : company._id,
            sender_id : senderId,
            receiver_id : accountantId,
            type : 'relationship',
            type2 : 'hiring'});
        console.log(company_node);

        if(last_accountant_node == null){
            console.log('send_hiring_req_to_accountant has no accountant')

        }
        else{
            
            const company_nodes = await Node.find({company_id:company._id,type2:"request",status: { $in: ['viewed', 'pending'] }});

            last_accountant_node.next = company_node._id;
            last_accountant_node.status = 'canceled';
            await last_accountant_node.save();

            company_nodes.forEach(async node => {
                node.next = company_node._id;
                node.status = 'canceled';
                await node.save();
            });
        }

        company.accountant = company_node._id;
        await company.save();


        console.log("Hiring Node Created");

        var notifications = await Notification.find({user_id:senderId,relevant_user_id:accountantId,type:'hiring-notification',status:'unread'});
        console.log('notification : '+notifications.length)
        if(notifications.length > 0){
            notifications.forEach(async notification => {
                notification.status = 'canceled';
                await notification.save();
            });
        }
        generalFunctions.create_notification(senderId, accountantId, companyId, accountantId, 'hiring-notification');

    }
    catch(e){
        console.log(e)
    }
}

async function cancel_hiring_req_to_accountant(companyId, accountantId){
    try{
        const company = await Company.findOne({_id:companyId});
        const company_node = await Node.findOne({_id:company.accountant});

        company_node.status = 'canceled';

        await company_node.save();

        const notification = await Notification.findOne({company_id:companyId,relevant_user_id:accountantId,type:'hiring-notification'})
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
            
        const new_company_node = generalFunctions.node_reply({
            target_node : company_node,
            reply: 'firing',
            text : ''
        });

        company.accountant = new_company_node._id;
        await company.save();

        //company_node.next = new_company_node._id;
        company_node.status = 'canceled';

        await company_node.save();

        const company_nodes = await Node.find({company_id:company._id,type:"request",status: { $in: ['viewed', 'pending'] }});

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
        if(select == 'all'){
            clients_Nodes = await Node.find({receiver_id:accountantId, type:'relationship',type2:'hiring', status: { $in: ['executed','pending', 'rejected'] }, next: { $exists: false } });
            
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
        const client = await Node.find({receiver_id:accountantId,company_id:clientId, type:'relationship',type2:'hiring', status: 'pending' });
        return client;

    }
    catch(e){
        console.log(e)
    }

}

async function relationship_accept_reject(companyId,action){
    try{
        const company = await Company.findOne({_id:companyId});
        const relationshipNode = await Node.findOne({_id:company.accountant});
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

