const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");
const Item = require("../../Schemas/Item");
const Warehouse = require("../../Schemas/Warehouse");
const Series = require("../../Schemas/Series");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const constants = require("../../constantsPaths");

router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      if (req.session.selected_client != undefined) {
        if (generalFunctions.checkAccessRigts(req)) {
          const results = req.session.search_results || [];

          // Clear the session data if necessary
          req.session.results = null;

          const data = {
            user: req.user,
            clientId: req.session.selected_client._id,
            results: results,
            notification_list: await Notification.find({
              $and: [{ user_id: req.user.id }, { status: "unread" }],
            }),
          };

          res.render(constants.pages.filters.view(), data);
        } else {
          res.redirect(
            "/error?origin_page=/&error=" + constants.url_param.param_1
          );
        }
      } else {
        res.redirect("/clients");
      }
    }
    else{
        res.redirect('/error?error='+access.error);
      }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", async (req, res) => {
  try {
    var fromdate = "";
    var from_date_url_data = "";
    var todate = "";
    var to_date_url_data = "";
    var query = {
      active: { $in: [1, 0] },
    };
    var active_url_data = "";
    var date = {};
    var title_url_data = "";
    var id_url_data = "";

    //Active -1,0,1
    if (req.body.filter_active_value == 1) {
      query.active = { $in: [1] };
      active_url_data = "&active=1";
    } else if (req.body.filter_active_value == 0) {
      query.active = { $in: [0] };
      active_url_data = "&active=0";
    }
    // Reg Date
    if (req.body.filter_reg_date_from != "") {
      fromdate = new Date(req.body.filter_reg_date_from);
      date.$gte = fromdate;
      from_date_url_data = "&fromdate=" + req.body.filter_reg_date_from;
    }

    if (req.body.filter_reg_date_to != "") {
      todate = new Date(req.body.filter_reg_date_to);
      date.$lte = todate;
      to_date_url_data = "&todate=" + req.body.filter_reg_date_to;
    }

    //Title Conains
    if (req.body.filter_title != "") {
      query.title = { $regex: req.body.filter_title, $options: "i" }; // Case-insensitive search
      title_url_data = "&title=" + req.body.filter_title;
    }
    // ID Contains
    if (req.body.filter_id != "") {
      let regexPattern = "";
      const filterId = req.body.filter_id;

      if (filterId.startsWith("*") && filterId.endsWith("*")) {
        regexPattern = filterId.slice(1, -1);
      } else if (filterId.startsWith("*")) {
        regexPattern = filterId.slice(1) + "$";
      } else if (filterId.endsWith("*")) {
        regexPattern = "^" + filterId.slice(0, -1);
      } else {
        regexPattern = "^" + filterId + "$";
      }

      query.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: regexPattern,
          options: "i",
        },
      };
      id_url_data = "&id=" + req.body.filter_id;
    }

    // Add the date query to the query object if it has valid conditions
    if (Object.keys(date).length > 0) {
      query.registrationDate = date;
    }
    var results = "";
    if (req.body.filter_type_input == "filter_type_warehouse") {
      results = await Warehouse.find(query);
    } else if (req.body.filter_type_input == "filter_type_item") {
      results = await Item.find(query);
    } else if (req.body.filter_type_input == "filter_type_series") {
      results = await Series.find(query);
    }
    console.log(results);

    var type_url_data = "type=" + req.body.filter_type_input;

    req.session.search_results = results;
    var redirect_url =
      "/search-filters?" +
      type_url_data + //Type
      active_url_data + //Active
      from_date_url_data + //From Date
      to_date_url_data + //To Date
      title_url_data + //Title
      id_url_data; //Id
    res.redirect(redirect_url);
  } catch (e) {
    console.error("Error on create page:", e);
    res.redirect("/error?origin_page=/log-in?fast_log_in=1&error=" + e);
  }
});

module.exports = router;
