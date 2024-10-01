const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");
const Item = require("../../Schemas/Item");

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
          const filterParam = req.query.filter;
          if (!titleParam) {
            console.log("X");
          } else if (filterParam == "1") {
            console.log(titleParam);
          }
          const data = {
            user: req.user,
            clientId: req.session.selected_client._id,
            item_list: await Item.find({
              companyID: req.session.selected_client._id,
            }),
            notification_list: await Notification.find({
              $and: [{ user_id: req.user.id }, { status: "unread" }],
            }),
          };

          res.render(constants.pages.items.view(), data);
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

router.post("/", (req, res) => {
  //res.redirect('/items?filters=1'); // Redirect to the GET route
});

module.exports = router;
