const express = require("express");
const router = express.Router();
const url = require('url');

const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

//Models
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const User = require(path_constants.schemas.two.user);
const Person = require(path_constants.schemas.two.person);
const Client = require(path_constants.schemas.two.client);
const Accountant = require(path_constants.schemas.two.accountant);




router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("ViewRoutes");
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      if(req.query.id){
        var company = await Company.findOne({ _id: req.query.id });
        if(company){
          let nodes = await Node.find({ company: company._id , type: 6, type2: { $in: [61, 62] }, next: "-", status: 2 });

            nodes = await Promise.all(
              nodes.map(async (n) => {
                const c = await Client.findOne({ _id: n.receiver_id });
                return {
                  _id: n._id,
                  user: { _id: c._id, firstName: c.firstName, lastName: c.lastName },
                  data: n.data,
                  type2: n.type2,
                  text: n.text,
                };
              })
            );
            console.log(nodes)

            res.render(path_constants.pages.calendar.view(), {
              user: req.user,
              nodes: nodes,
              users: await Client.find({ company: req.query.id, status: 1 })
            });
        }
        else{
          res.redirect("/list?searchfor=clients&message=noclient");
        }

      }else{
        res.redirect("/list?searchfor=clients&message=noclient");
      }

    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error saving user:", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    var node;
    console.log("CalendarRoutes");
    //var obj_type = req.body.obj_type;
    var obj_id = req.body.obj_id;

    if(req.body.day_data_input_node_id != ""){
      node = generalFunctions.node_reply ({
        target_node : await Node.findOne({ _id: req.body.day_data_input_node_id }),
        type2: parseInt(req.body.time_table_type),
        text:  req.body.time_table_notes,
        user : req.user._id,
        data: {
          date: req.body.day_data_input_date,
          hour_start : req.body.time_table_hours_start,
          minutes_start : req.body.time_table_minutes_start,
          hour_end : req.body.time_table_hours_end,
          minutes_end : req.body.time_table_minutes_end,
        }
      });
    }
    else if(req.body.action == "new"){
      const startDate = new Date(req.body.day_data_input_date);
      const endDate = new Date(req.body.day_data_input_date_to);

      var users = req.body.day_data_input_user_id.split(';');

      // Loop through the dates
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        var d = date.toISOString().split('T')[0]; // the date in 'YYYY-MM-DD' format
        for( u of users){
          node = generalFunctions.create_node({
            company: req.body.obj_id,
            sender_id: req.user._id,
            receiver_id: u,
            type: 6, //calendar
            type2: req.body.time_table_type, //61 work / 62 leave
            text:  req.body.time_table_notes,
            data: {
              date: d,
              hour_start : req.body.time_table_hours_start,
              minutes_start : req.body.time_table_minutes_start,
              hour_end : req.body.time_table_hours_end,
              minutes_end : req.body.time_table_minutes_end,
            }
          })
        }
      }
    }
    

    return res.redirect('/calendar?id='+obj_id+'&timetable='+req.body.calendar_view_selection+'&timetable_user='+req.body.day_data_input_user_filter+'&refresh=1');

  } catch (e) {
    console.error(e);
    return res.redirect("/error?origin_page=/&error=" + encodeURIComponent(e.message));
  }
});


module.exports = router;
