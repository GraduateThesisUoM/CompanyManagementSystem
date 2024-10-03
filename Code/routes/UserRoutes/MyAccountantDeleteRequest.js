const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');


//Models
const Request = require("../../Schemas/Node");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);

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
      res.redirect('/error?error=' + err);
    }
});

module.exports = router;
  