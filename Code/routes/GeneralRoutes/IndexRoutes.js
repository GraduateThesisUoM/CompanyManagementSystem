const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require("../../constantsPaths");

//Models
const User = require(path_constants.schemas.two.user);
const Client = require(path_constants.schemas.two.client);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Company = require(path_constants.schemas.two.company);
const Accountant = require(path_constants.schemas.two.accountant);


//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder
  .two);
//Get clients Function
const clientAccountantFunctions = require(path_constants
  .clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {

    const company = await Company.findOne({ _id: req.user.company });
    req.session.company = company;
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      var data = {};

      if (req.user.type == "accountant") {

        const nodes_pending = await Node.find({
          //receiver_id: req.user._id,
          $or: [{ receiver_id: req.user._id }, { sender_id: req.user._id }],
          $or: [{ status: 3 }, { status: 1 }],//pending, viewed
          //root : 1
          next:'-',
          type: { $in: [1, 3] }//relationship,request
        });

        const nodes_rejected = await Node.find({
          //receiver_id: req.user._id,
          $or: [{ receiver_id: req.user._id }, { sender_id: req.user._id }],
          status: 4,//rejected
          //root : 1
          next:'-',
          type: { $in: [1, 3] }//relationship,request
        });
        const nodes_executed = await Node.find({
          //receiver_id: req.user._id,
          $or: [{ receiver_id: req.user._id }, { sender_id: req.user._id }],
          status: 2,//executed
          //root : 1
          next:'-',
          type: { $in: [1, 3] }//relationship,request
        });

        const clients = await clientAccountantFunctions.fetchClients(
          req.user._id,
          "all"
        );

        var pending_nodes_list = []
        for( node of nodes_pending){
          const company = await Company.findOne({ _id: node.company });
          pending_nodes_list.push({
            id:node._id,
            type:node.type,
            title: node.type2,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }

        var rejected_nodes_list = [];
        for( node of nodes_rejected){
          const company = await Company.findOne({ _id: node.company });
          rejected_nodes_list.push({
            id:node._id,
            type:node.type,
            title: node.type2,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }

        var executed_nodes_list = []
        for( node of nodes_executed){
          const company = await Company.findOne({ _id: node.company });
          executed_nodes_list.push({
            id:node._id,
            type:node.type,
            title: node.type2,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }


        data = {
          user: req.user,
          pending_nodes_list:pending_nodes_list,
          executed_nodes_list:executed_nodes_list,
          rejected_nodes_list:rejected_nodes_list,

          notification_list: await Notification.find({
            $and: [{ user_id: req.user.id }, { status: "unread" }],
          }),
          clients: clients,
        };
      } else if (req.user.type == "user") {
        //index for users
        
        data = {
          user: req.user,
          company: company,
          notification_list: await Notification.find({
            $and: [{ user_id: req.user.id }, { status: "unread" }],
          }),
        };
      } else if (req.user.type == "admin") {
        var pending_reports = await Node.find({type: 7, status: 3 });
        var pending_reports_list = [];

        for (let i = 0; i < 5 && i < pending_reports.length; i++) {
          const report = pending_reports[i];
          const reporter = await User.findOne({ _id: report.sender_id });
          const reported = await User.findOne({ _id: report.receiver_id });
          pending_reports_list.push({
            id: report._id,
            reason: generalFunctions.get_type2(report.type2),
            registrationDate: generalFunctions.formatDate(report.registrationDate),
            status: generalFunctions.get_status(report.status),
            reporter: reporter,
            reported: reported
          });
        }

        var pending_viewed_reports_list = [];
        
        var pending_viewed_reports = await Node.find({type: 7, status: 1 });
        
        var limit = Math.min(5, pending_viewed_reports.length);
        limit = limit -1
        console.log(limit)
        for (let i = 0; i < limit; i++) {
          const report = pending_viewed_reports[i];
          const reporter = await User.findOne({ _id: report.sender_id });
          const reported = await User.findOne({ _id: report.receiver_id });
          pending_viewed_reports_list.push({
            id: report._id,
            reason: generalFunctions.get_type2(report.type2),
            registrationDate: generalFunctions.formatDate(report.registrationDate),
            status: generalFunctions.get_status(report.status),
            reporter: reporter,
            reported: reported
          });
        }

        // index for admins
        data = {
          user: req.user,
          user_list: await User.find(),
          company_list: await Company.find(),
          pending_reports: pending_reports_list,
          viewed_reports:pending_viewed_reports_list
        };
      }
      //console.log(await generalFunctions.warehose_get_inventory({company : company._id}));

      res.render(path_constants.pages.index.view(req.user.type), data);
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }

});

module.exports = router;
