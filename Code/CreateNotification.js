express = require("express");
const Notification = require("./Schemas/Notification");

async function create_notification(userID, relevantUserID, companyID, relevantCompanyID, notificationType){
    // check if a notification of the same type exists for user
    var exist_check = await Notification.findOne({$and: [{user_id: userID}, {type: notificationType}, {company_id: companyID}, {status: "unread"}]});

    // if not
    if(exist_check == null){
        const newNotification = new Notification({ //Notification constructor
            user_id: userID,
            relevant_user_id: relevantUserID,
            company_id: companyID,
            relevant_company_id: relevantCompanyID,
            type: notificationType,
            status: "unread",
        });
        await newNotification.save();
    }
}

module.exports = create_notification;

