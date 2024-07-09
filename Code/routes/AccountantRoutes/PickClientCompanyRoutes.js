const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require('../../constantsPaths');

//Models
const Notification = require(path_constants.schemas.two.notification);
const Client = require(path_constants.schemas.two.client);

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   WORKING */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  const clients = await Client.find({}); // Fetch all accountants from the database
  clients.sort((a, b) => a.firstName.localeCompare(b.firstName));

  res.render('accountant_pages/create_page.ejs', {user: req.user, clients: clients,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});
module.exports = router;
