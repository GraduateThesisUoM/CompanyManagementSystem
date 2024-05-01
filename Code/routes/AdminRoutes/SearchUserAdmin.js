const express = require("express");
const router = express.Router();

//Models
const User = require("../../Schemas/User");

/*--------   SEARCH FOR USER IN ADMIN PAGE */
/*--------   to be optimized */
router.post('/', async (req, res) => {
    try{
      let payload = req.body.payload.trim();
  
      if(req.body.type === 'everyone'){
        var resultByFname = await User.find({firstName: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, account_status: req.body.status}).exec();
        var resultByLname = await User.find({lastName: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, account_status: req.body.status}).exec();
        var resultByEmail = await User.find({email: {$regex: new RegExp('^'+payload+'.*','i')}, type: {$ne: 'admin'}, account_status: req.body.status}).exec();
      }
      else{
        var resultByFname = await User.find({firstName: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, account_status: req.body.status}).exec();
        var resultByLname = await User.find({lastName: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, account_status: req.body.status}).exec();
        var resultByEmail = await User.find({email: {$regex: new RegExp('^'+payload+'.*','i')}, type: req.body.type, account_status: req.body.status}).exec();
      }
    
    
      var search = resultByFname.concat(resultByLname, resultByEmail); 
    
      for(var i=0;i<search.length;i++){
        for(var j=i+1;j<search.length;j++){
          if(search[i]._id.equals(search[j]._id)){
            search.splice(j, j);
            j--;
          }
        }
      }
    
      res.send({payload: search});
    }
    catch (err) {
      console.error('Error searching for user:', err);
      res.redirect('/error?origin_page=get-data&error=' + err);
    }
});

module.exports = router;