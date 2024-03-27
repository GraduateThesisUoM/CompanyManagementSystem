express = require("express");
//Models
const Accountant  = require("./Schemas/Accountant");
const Company  = require("./Schemas/Company");
const Request = require("./Schemas/Request");

async function send_hiring_req_to_accountant(userId, accountantId){
    // check if a notification of the same type exists for user
    const req = new Request({
        sender_id: userId,
        receiver_id:accountantId,
        type: 'hiring',
        title:'Hiring Request'
    });

    await req.save();
}

module.exports = send_hiring_req_to_accountant;

