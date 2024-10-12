const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const path_constants = require("../../constantsPaths");

//Models
const Report = require(path_constants.schemas.two.report);
const Review = require(path_constants.schemas.two.review);
const User = require(path_constants.schemas.two.user);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   ADMIN - USER PROFILE*/
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      var target_user = await User.findOne({ _id: req.query.id });
      var list_of_clients = [];
      var target_company;

      if (target_user.type == "accountant") {
        // check if target user is an accountant so we can pass client list as a parameter
        var list_of_clients = await Company.find({ accountant: req.query.id });
      } else if (target_user.type == "user") {
        // check if target user is an accountant so we can pass client list as a parameter
        var target_company = await Company.findOne({
          _id: target_user.company,
        });
        let target_node = await Node.findOne({
          _id: target_company.accountant,
        });
        console.log(target_node);
        var accountant = target_node.receiver_id;
      }
      res.render("admin_pages/user_info_page.ejs", {
        user: req.user,
        target_user: await User.findOne({ _id: req.query.id }),
        target_company: target_company,
        reports_for_user: await Report.find({
          $and: [
            { reported_id: req.query.id },
            { reporter_id: { $ne: req.query.id } },
            { status: "pending" },
          ],
        }),
        reports_by_user: await Report.find({
          $and: [
            { reporter_id: req.query.id },
            { reported_id: { $ne: req.query.id } },
            { status: "pending" },
          ],
        }),
        reviews_for_user: await Review.find({ reviewed_id: req.query.id }),
        user_list: await User.find(),
        company_list: await Company.find(),
        general_reports: await Report.find({
          $and: [{ reporter_id: req.query.id }, { reported_id: req.query.id }],
        }),
        list_of_clients,
        accountant,
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
