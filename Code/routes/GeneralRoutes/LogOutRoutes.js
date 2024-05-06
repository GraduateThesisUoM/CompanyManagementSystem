const express = require("express");
const router = express.Router();

//Models
const User = require("../../Schemas/User");

/*--------   LOG OUT */
router.delete('/', async (req, res) => {
  try{
    const user = await User.findOne({_id:req.user.id});
    user.last_log_out = new Date().toISOString();
    user.save()
    req.logout(() => {
      res.redirect('/log-in');
    });
  }
  catch(e){
    res.redirect('/');
  }
});

module.exports = router;