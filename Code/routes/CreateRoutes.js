const express = require("express");
const router = express.Router();

//Models
const Warehouse = require("../Schemas/Warehouse");
const Notification = require("../Schemas/Notification");
const Client = require("../Schemas/Client");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

/*--------   WORKING */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  const clients = await Client.find({}); // Fetch all accountants from the database
  clients.sort((a, b) => a.firstName.localeCompare(b.firstName));

  res.render('accountant_pages/create_page.ejs', {user: req.user, clients: clients,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
});

  router.post('/warehouse', Authentication.checkAuthenticated, async (req, res) => {
    try{
      const warehouse = new Warehouse({
        title: req.body.warehouse_title,
        location: req.body.warehouse_location
      });
      // Save the new user to the database
    await warehouse.save();
    }
    catch (err) {
      console.error('Error deleting account:', err);
      res.redirect('/error?origin_page=delete-account&error='+err);
    }
});

module.exports = router;
