const express = require("express");
const router = express.Router();

//Models
const Review  = require("../../Schemas/Review");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   ADMIN - REMOVE REVIEW */
router.post('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
      await Review.deleteOne({_id: req.query.id});
      res.redirect('back');
    }
    catch (err) {
      console.error('Error deleting review:', err);
      res.redirect('/error?origin_page=remove-review&error=' + err);
    }
});

module.exports = router;