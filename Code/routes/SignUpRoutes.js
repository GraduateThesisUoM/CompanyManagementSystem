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
  const companies_list = await Company.find();
  res.render('../views/sign_up.ejs',{users_list: users,companies :companies_list});
});

  router.post('/', async (req, res) => {
    try {
      const saltRounds = 10; // You can adjust the number of salt rounds for security
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      // Create a new user instance with the provided data
      if (req.body.account_type == 'user'){
        var company;
        if(req.body.companyNewExisting == '0'){
          //New Company
          company = new Company({
            name : req.body.companyName,
            logo : req.body.companyLogo,
            signupcode : generateRandomCode(6)
          });
          await company.save();
        }
        else{
          //Existing Company
          company = await Company.findOne({name:req.body.companyName, signupcode:req.body.companyRegisterCode});
        }
        const newUser = new Client({
          type: req.body.account_type,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hashedPassword,
          email: req.body.email,
          afm: req.body.afm,
          mydatakey: req.body.mydatakey,
          company: company._id
        });
        if(req.body.companyNewExisting == '0'){
          newUser.companyOwner = 1;
        }
        else{
          company.users_num = company.users_num + 1;
          await company.save();
        }
        // Save the new user to the database
      await newUser.save();
      if (req.body.self_accountant == "true"){
        company.companyaccountant.id = "self_accountant";
        company.companyaccountant.status = "self_accountant";
      }
      await company.save();
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
        console.log("admin sign in");
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