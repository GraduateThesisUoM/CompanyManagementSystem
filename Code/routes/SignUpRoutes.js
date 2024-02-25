const express = require("express");
const router = express.Router();

const bcrypt = require('bcrypt');

//Models
const User = require("../Schemas/User");
const Accountant  = require("../Schemas/Accountant");
const Client  = require("../Schemas/Client");
const Company  = require("../Schemas/Company");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------   SING UP */
router.get('/', Authentication.checkNotAuthenticated, async (req, res) => {
  const users = await User.find();
    res.render('../views/sign_up.ejs',{users_list: users});
  });

  router.post('/', async (req, res) => {
    try {
      const saltRounds = 10; // You can adjust the number of salt rounds for security
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      // Create a new user instance with the provided data
      console.log(req.body.companyNewExisting);
      try{
        if(req.body.companyNewExisting = '0'){
          const newComany = new Company({
            companyName : req.body.companyName,
            companyLogo : req.body.companyLogo,
            signupcode : generateRandomCode(6)
          });
          await newComany.save();
        }
        else{
          console.log('fff');
        }
      }
      catch(e){
        console.error('Error creating company ', err);
        res.redirect('/error?origin_page=sign-up&error='+err);
      }
      if (req.body.account_type == 'user'){
        const newUser = new Client({
          type: req.body.account_type,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hashedPassword,
          email: req.body.email,
          afm: req.body.afm,
          mydatakey: req.body.mydatakey/*,
          companyName: req.body.companyName,
          companyLogo: req.body.companyLogo*/
        });
        // Save the new user to the database
      //await newUser.save();
      if (req.body.self_accountant == "true"){
        newUser.myaccountant.id = newUser._id;
        newUser.myaccountant.status = "self_accountant";
      }
      //await newUser.save();
      console.log("User created successfully");
      }
      else if (req.body.account_type == 'accountant'){
        const newAccountant = new Accountant({
          type: req.body.account_type,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hashedPassword,
          email: req.body.email,
          afm: req.body.afm,
          mydatakey: req.body.mydatakey,
          clients:[]
        });
        // Save the new user to the database
      await newAccountant.save();
      console.log("Accountant created successfully");
      }
      else if (req.body.account_type == 'admin'){
        const newUser = new User({
          type: req.body.account_type,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hashedPassword,
          email: req.body.email
        });
        // Save the new user to the database
      await newUser.save();
      console.log("Admin created successfully");
      }
      res.redirect('/log-in?message=success_sign_up');
    } catch (err) {
      console.error('Error saving user:', err);
      res.redirect('/error?origin_page=sign-up&error='+err);
    }
});

function generateRandomCode(length) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
  }

  return code;
}

module.exports = router;