express = require("express");
//Models
const Accountant  = require("./Schemas/Accountant");
const Company  = require("./Schemas/Company");
const Request = require("./Schemas/Request");
const Client  = require("./Schemas/Client");
const { request } = require("express");


async function send_hiring_req_to_accountant(companyId,senderId, accountantId){
    // check if a notification of the same type exists for user
    /*const client_company = await Client.findOne({_id:userId});
    const client_company = await Company.findOne({_id:companyId});*/
    try{

        const company_requests = await Request.find({company_id:companyId});

        const requ = new Request({
            company_id: companyId,
            sender_id: senderId,
            receiver_id:accountantId,
            type: 'hiring',
            title:'Hiring Request'
        });

        if(requ.company_id == requ.receiver_id){
            requ.status = 'executed';
            const client_company = await Company.findOne({_id:companyId});
            client_company.companyaccountant.id = 'self_accountant';
            client_company.companyaccountant.status = 'self_accountant';
            await client_company.save();
        }

        await requ.save();

        company_requests.forEach(async request => {
            if(request.status =='pending' || request.status =='viewed' ){
                if(request._id != requ._id){
                    request.status = 'canceled';
                    request.canseled = requ._id;
                    await request.save();
                }
            }
            else if(request.status =='executed' && request.company_id == request.receiver_id && request.type == 'hiring' && request._id != requ._id){
                request.status = 'canceled';
                request.canseled = requ._id;
                await request.save();
            }
        });
        console.log("Hiring Request Send");
    }
    catch(e){
        console.log(e)
    }
}

async function fire_accountant(companyId,senderId){
    try{
        const company = await Company.findOne({_id:companyId});
        if (company) {
            company.companyaccountant.status = 'fired';
            await company.save();
        } else {
            console.log('Company not found');
        }


        const requ = new Request({
            company_id: companyId,
            sender_id: senderId,
            receiver_id:company.companyaccountant.id,
            type: 'firing',
            title:'Firing Accountant'
        });

        await requ.save();


        company_requests.forEach(async request => {
            if(request.status =='pending' || request.status =='viewed' ){
                if(request._id != requ._id){
                    request.status = 'canceled';
                    request.canseled = requ._id;
                    await request.save();
                }
            }
            else if(request.status =='executed' && request.company_id == request.receiver_id && request.type == 'hiring' && request._id != requ._id){
                request.status = 'canceled';
                request.canseled = requ._id;
                await request.save();
            }
        });
        console.log("Accountant Fired Succesfully");
    }
    catch(e){
        console.log(e)
    }
}

module.exports = { send_hiring_req_to_accountant, fire_accountant };

