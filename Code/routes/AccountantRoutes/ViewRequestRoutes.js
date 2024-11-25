const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");
const generalFunctions = require(path_constants.generalFunctions_folder.two);
const Authentication = require(path_constants.authenticationFunctions_folder
  .two);

//Models
const Client = require(path_constants.schemas.two.client);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Company = require(path_constants.schemas.two.company);

//GET REQUEST
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const node = await Node.findOne({ _id: req.query.req_id });
      if (node.status == "pending") {
        node.status = "viewed";
        await node.save();
      }
      const accountants_client = await Client.findOne({ _id: node.sender_id });
      const accountants_client_company = await Company.findOne({
        _id: node.company,
      });

      const data = {
        user: req.user,
        request: node,
        company: accountants_client_company,
        accountants_client: accountants_client,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user.id }, { status: "unread" }],
        }),
      };
      res.render("accountant_pages/view_request.ejs", data);
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

//POST REQUEST
router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const action = req.body.action;
    const node = await Node.findOne({ _id: req.body.request_id });
    node.status = action;
    if (node.type != "hiring") {
      node.text = req.body.response;
    }

    await node.save();
    await generalFunctions.create_notification(
      node.sender_id,
      req.user.id,
      node.company,
      req.user.id,
      "assignments-status-notification"
    );

    res.redirect("/");
  } catch (err) {
    console.error("Error saving user:", err);
    res.redirect("/error?origin_page=view-request&error=" + err);
  }
});

module.exports = router;
