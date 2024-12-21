const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const path_constants = require("../../constantsPaths");

//Models
const User = require(path_constants.schemas.two.user);
const Accountant = require(path_constants.schemas.two.accountant);
const Company = require(path_constants.schemas.two.company);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder
  .two);
const clientAccountantFunctions = require(path_constants
  .clientAccountantFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two);

/*--------   SING UP */
router.get("/", Authentication.checkNotAuthenticated, async (req, res) => {
  try {

    const users = await User.find();
    const companies_list = await Company.find();
    res.render("../views/sign_up.ejs", {
      users_list: users,
      companies: companies_list,
    });
    
  } catch (err) {
    console.error("Error updating user data:", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", async (req, res) => {
  try {
    // Check if the email is already in use
    const email = req.body.email;

    const companyName = req.body.companyName;
    const saltRounds = 10; // You can adjust the number of salt rounds for security
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    // Create a new user instance with the provided data
    if (req.body.account_type == "user") {
      var company;
      if (req.body.companyNewExisting == "0") {
        //New Company

        var data = {
          name: companyName,
          signupcode: 1,
          /*signupcode : generateRandomCode(length)*/
        };
        if (req.body.companyLogo) {
          data.logo = req.body.companyLogo; // Add `logo` only if it's provided
        }
        company = await generalFunctions.create_company(data);
      } else {
        //Existing Company
        company = await Company.findOne({
          name: companyName,
          signupcode: req.body.companyRegisterCode,
        });
      }

      var companyOwner = 0;
      if (req.body.companyNewExisting == "0") {
        companyOwner = 1;
      } else {
        company.license.used = company.license.used + 1;
        await company.save();
      }
      var data = {
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        email: email,
        afm: req.body.afm,
        mydatakey: req.body.mydatakey,
        company: company._id,
        companyOwner: companyOwner,
      };

      var newUser = await generalFunctions.create_user(data);

      // Save the new user to the database

      if (req.body.self_accountant == "true") {
        clientAccountantFunctions.send_hiring_req_to_accountant(
          company._id,
          newUser._id,
          company._id
        );
      }
      console.log("User created successfully");
    } else if (req.body.account_type == "accountant") {
      console.log("accountant sign in");
      const newAccountant = new Accountant({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        email: email,
        afm: req.body.afm,
        mydatakey: req.body.mydatakeyS,
      });
      // Save the new user to the database
      await newAccountant.save();
      console.log("Accountant created successfully");
    } else if (req.body.account_type == "admin") {
      console.log("admin sign in");
      const newUser = new User({
        type: req.body.account_type,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        email: email,
      });
      // Save the new user to the database
      await newUser.save();
      console.log("Admin created successfully");
    }
    res.redirect("/log-in?message=success_sign_up");
  } catch (err) {
    console.error("Error saving user:", err);
    res.redirect("/error?origin_page=sign-up&error=" + err);
  }
});

function generateRandomCode(length) {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

module.exports = router;
