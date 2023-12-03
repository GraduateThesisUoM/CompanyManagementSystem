const express = require("express");
const router = express.Router();

//Models
const Request = require("../Schemas/Request");

//Authentication Function
const Authentication = require("../AuthenticationFunctions");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      // Find and delete the request by its ID
      const deletedRequest = await Request.findOneAndDelete({ _id: req.body.request_id });
  
      if (deletedRequest) {
        console.log('Request deleted successfully');
        res.redirect('/my-accountant');
      } else {
        console.log('Request not found');
        res.redirect('/my-accountant');
      }
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error=' + err);
    }
});

module.exports = router;
  