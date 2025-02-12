const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require("../../constantsPaths");

//Models
const User = require(path_constants.schemas.two.user);
const Client = require(path_constants.schemas.two.client);
const Node = require(path_constants.schemas.two.node);
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

        const clients = await clientAccountantFunctions.fetchClients(
          req.user._id,
          "all"
        );

        const nodes_pending = await Node.find({
          receiver_id: req.user._id,
          status: 3,//pending
          next:'-',
          type: { $in: [1, 3] },//relationship,request
          type2 : { $nin: [3,9] }
        });
        console.log("nodes_pending")
        console.log(nodes_pending)


        var pending_nodes_list = []
        for( node of nodes_pending){
          const company = await Company.findOne({ _id: node.company });
          pending_nodes_list.push({
            id:node._id,
            type:generalFunctions.get_type(node.type),
            title: node.title,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }

        const nodes_pending_viewed = await Node.find({
          receiver_id: req.user._id,
          status: 1,//viewed
          next:'-',
          type: { $in: [1, 3] }//relationship,request
        });

        var pending_viewed_nodes_list = []

        for( node of nodes_pending_viewed){
          const company = await Company.findOne({ _id: node.company });
          pending_viewed_nodes_list.push({
            id:node._id,
            type:generalFunctions.get_type(node.type),
            title: node.title,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }
        
        
        const executed_nodes = await Node.find({
          sender_id: req.user._id,
          status: { $in: [1, 3] },//executed
          next:'-',
          type: 3,//relationship,request
          type2 : { $ne: 3 }
        });

        console.log("Executed")
        console.log(executed_nodes)

        var executed_nodes_list = []

        for( node of executed_nodes){
          const company = await Company.findOne({ _id: node.company });
          executed_nodes_list.push({
            id:node._id,
            type:generalFunctions.get_type(node.type),
            title: node.title,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }


        var rejected_nodes_list = []

        const rejected_nodes = await Node.find({
          receiver_id: req.user._id,
          status: { $in: [4, 5] },//rejected
          next:'-',
          type: { $in: [1, 3] },//relationship,request
          //type2 : { $ne: 3 }
        });

        for( node of rejected_nodes){
          const company = await Company.findOne({ _id: node.company });
          rejected_nodes_list.push({
            id:node._id,
            type:generalFunctions.get_type(node.type),
            title: node.title,
            reg_date: generalFunctions.formatDate(node.registrationDate) ,
            due_date: node.due_date ? generalFunctions.formatDate(node.due_date) : "-",
            company : company.name,
            status: node.status
          })
        }

        console.log("Recected")
        console.log(rejected_nodes)


        data = {
          user: req.user,
          pending_nodes_list:pending_nodes_list,
          viewed_nodes_list:pending_viewed_nodes_list,
          executed_nodes_list:executed_nodes_list,
          rejected_nodes_list:rejected_nodes_list,

          clients: clients,
        };
      } else if (req.user.type == "user") {
        //index for users
        
        data = {
          user: req.user,
          company: company,
        };
      } else if (req.user.type == "admin") {
        //var license_nodes = await Node.find({type: 10,type2: 6, status: {$in: [1,3]} ,next:"-"});
        const companies_req_l = await Company.find({ "license.requested": { $ne: 0 } });
        /*var license_nodes_list = [];
        for (let i = 0; i < 5 && i < license_nodes.length; i++) {
          const node = license_nodes[i];
          license_nodes_list.push({
            _id : node._id,
            company : await Company.findOne({_id:node.company})
          })
        }

        console.log("license_nodes_list");
        console.log(license_nodes_list);*/

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
          viewed_reports:pending_viewed_reports_list,
          //license_nodes_list:license_nodes_list,
          companies_req_l : companies_req_l,
          users : {
            admins : {
              active : await User.find({type:'admin', status: 1}),
              disabled : await User.find({type:'admin', status: 0}),
              deleted : await User.find({type:'admin', status: 2}),
              banned : await User.find({type:'admin', status: 3}),
            },
            users : {
              active : await User.find({type:'user', status: 1}),
              disabled : await User.find({type:'user', status: 0}),
              deleted : await User.find({type:'user', status: 2}),
              banned : await User.find({type:'user', status: 3}),
            },
            accountants : {
              active : await User.find({type:'accountant', status: 1}),
              disabled : await User.find({type:'accountant', status: 0}),
              deleted : await User.find({type:'accountant', status: 2}),
              banned : await User.find({type:'accountant', status: 3}),
            }
          },
          companies : {
            active : await Company.find({status: 1}),
            disabled : await Company.find({status: 0}),
          }
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

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try{
    console.log("Index Post")
    
    var company = await Company.findOne({_id:req.body.data_id});
    
    if(req.body.action == 'approve'){
      company.license.bought = company.license.bought + company.license.requested;
    }
    company.license.requested = 0;
    await company.save();

    return res.redirect(`/`);


  } catch (e) {
    console.error(e);
    return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
  }
});

module.exports = router;
