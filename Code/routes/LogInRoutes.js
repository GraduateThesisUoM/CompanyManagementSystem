const express = require("express");
const router = express.Router();

const bcrypt = require('bcrypt');
var mongoose = require('mongoose');


const passport = require('passport');

const Accountant  = require("../Schemas/Accountant");;
const Review  = require("../Schemas/Review");
const Node = require("../Schemas/Node");
const Client = require("../Schemas/Client");
const Company = require("../Schemas/Company");
const User = require("../Schemas/User");


const Notification = require("../Schemas/Notification");

const clientAccountantFunctions = require("../ClientAccountantFunctions");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../GeneralFunctions");

/*--------   LOG IN */
router.get('/', Authentication.checkNotAuthenticated, (req,res) => {
  generalFunctions.checkAccessRigts('d',req.originalUrl,res);

  //FOR TEST START
  //create_users();
  if (req.query.restart === 'true') {
    // If restart=true, run create_users()
    create_users();
  }
  //FOR TEST END
  res.render('../views/log_in.ejs');
});
  router.post('/', Authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
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

  const user1 = await create_user("sa",company1,1);

  await clientAccountantFunctions.send_hiring_req_to_accountant(company1._id,user1._id,company1._id,'relationship','hiring');

  
  const company2 = await create_company("2");

  const user2 = await create_user("c1",company2,1);

  const user3 = await create_user("c2",company2,0);

  const accountant1 = await create_accountant("a1");
  await clientAccountantFunctions.send_hiring_req_to_accountant(company2._id,user2._id,accountant1._id,'relationship','hiring');

  const accountant2 = await create_accountant("a2");

  const admin1 = await create_admin("ad1")

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
  console.log(NewAdmin);
  console.log("-----------------------");
  return NewAdmin;
}
