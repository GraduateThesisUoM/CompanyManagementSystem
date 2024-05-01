const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");

//POST REQUEST
router.post('/', async (req, res) =>{
    try{
      var notif_id =  req.body.notification_id;
      await Notification.updateOne({_id: notif_id},{$set: {status: "read"}});
      res.sendStatus(200);
    }
    catch (err) {
      console.error('Error changing notification:', err);
      res.redirect('/error?origin_page=/notification-read&error=' + err);
    }
});

module.exports = router;