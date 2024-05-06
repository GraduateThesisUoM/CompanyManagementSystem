const express = require("express");
const router = express.Router();

require('dotenv').config();

const bcrypt = require('bcrypt');
var mongoose = require('mongoose');


const passport = require('passport');

const Accountant  = require("../../Schemas/Accountant");;
const Review  = require("../../Schemas/Review");
const Node = require("../../Schemas/Node");
const Client = require("../../Schemas/Client");
const Company = require("../../Schemas/Company");
const User = require("../../Schemas/User");


const Notification = require("../../Schemas/Notification");

const clientAccountantFunctions = require("../../ClientAccountantFunctions");

//File with the paths
const path_constants = require('../../constantsPaths');

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------   LOG IN */
router.get('/', Authentication.checkNotAuthenticated, (req, res) => {
  //FOR TEST START
  if (req.query.restartdb === 'true') {
    create_users();
  }
  //FOR TEST END
  //generalFunctions.checkAccessRigts('.',req,res,data);
  //res.render('../views/log_in.ejs');
  res.render("."+path_constants.pages.log_in.view());
});
router.post(path_constants.pages.index.url, Authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: path_constants.pages.index.url,
    failureRedirect: path_constants.pages.log_in.url,
    failureFlash: true
}));

module.exports = router;

//---------------TEST-------------------------------------------------
async function create_users(){

  const Company = mongoose.model('Company');

  // Assuming you want to delete the "Company" collection
  try {
      await Company.collection.drop();
      console.log("Collection Company deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }
  const Node = mongoose.model('Node');

  // Assuming you want to delete the "Company" collection
  try {
      await Node.collection.drop();
      console.log("Collection Node deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }
  
  const User = mongoose.model('users');

  // Assuming you want to delete the "Company" collection
  try {
      await User.collection.drop();
      console.log("Collection User deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }

  const company1 = await create_company("1");
  const company2 = await create_company("2");
  const company3 = await create_company("3");
  const company4 = await create_company("4");
  const company5 = await create_company("5");

  const user1 = await create_user("sa",company1,1);
  const user2 = await create_user("c1",company2,1);
  const user3 = await create_user("c2",company2,0);
  const user4 = await create_user("c3",company3,1);
  const user5 = await create_user("c4",company4,1);
  const user6 = await create_user("c5",company5,0);


  const accountant1 = await create_accountant("a1");
  const accountant2 = await create_accountant("a2");

  const admin1 = await create_admin("ad1")

  //self Acountant
  await clientAccountantFunctions.send_hiring_req_to_accountant(company1._id,user1._id,company1._id,'relationship','hiring');
  // C2 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(company2._id,user2._id,accountant1._id,'relationship','hiring');
  await clientAccountantFunctions.relationship_accept_reject(company2._id,'executed')
  // C3 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(company3._id,user4._id,accountant1._id,'relationship','hiring');
  await clientAccountantFunctions.relationship_accept_reject(company3._id,'rejected')
  // C4 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(company4._id,user5._id,accountant1._id,'relationship','hiring');
  // C5 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(company5._id,user5._id,accountant1._id,'relationship','hiring');
  await clientAccountantFunctions.fire_accountant(company5._id,user5._id,accountant1._id,'relationship','hiring');


  console.log("----------   END ");

}

//   TESTING
async function create_user(text,company,cOwner){
  const user = new Client({
    type: 'user',
    firstName: text+'_fn',
    lastName: text+'_ln',
    password: await bcrypt.hash('1', 10),
    email: text+"@"+text,
    afm: text+'_afm',
    mydatakey: text+'_mdk',
    company: company._id,
    companyOwner :cOwner
  });

  await user.save();

  console.log(user);
  console.log("-----------------------");

  return user;
}

async function create_company(index){
  const company = new Company({
    name : 'c'+index,
    //logo : req.body.companyLogo,
    logo : "https://static.vecteezy.com/system/resources/previews/008/214/517/non_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg",
    signupcode : '1'
  });
  await company.save();
  console.log(company);
  console.log("-----------------------");
  return company
}

async function create_accountant(text){
  const newAccountant = new Accountant({
    type: 'accountant',
    firstName: text+'_fn',
    lastName: text+'_ln',
    password: await bcrypt.hash('1', 10),
    email: text+"@"+text,
    afm: text+'_afm',
    mydatakey: text+'_mdk'
  });

  await newAccountant.save();

  console.log(newAccountant);
  console.log("-----------------------");

  return newAccountant;
}

async function create_admin(text){
  const NewAdmin = new User({
    type: 'admin',
    firstName: text+"_fn",
    lastName: text+"_ln",
    password: await bcrypt.hash('1', 10),
    email: text+"@"+text
  });
  await NewAdmin.save();
  console.log(NewAdmin);
  console.log("-----------------------");
  return NewAdmin;
}
