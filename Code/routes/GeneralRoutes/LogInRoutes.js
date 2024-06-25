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
const Item = require("../../Schemas/Item");


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

  try {
      await Company.collection.drop();
      console.log("Collection Company deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }
  const Node = mongoose.model('Node');

  try {
      await Node.collection.drop();
      console.log("Collection Node deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }
  
  const User = mongoose.model('users');

  try {
      await User.collection.drop();
      console.log("Collection User deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }

  const Item = mongoose.model('item');

  try {
      await Item.collection.drop();
      console.log("Collection Item deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }

  const Warehouse = mongoose.model('warehouses');

  try {
      await Warehouse.collection.drop();
      console.log("Collection Warehouse deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }

  const Series = mongoose.model('series');

  try {
      await Series.collection.drop();
      console.log("Collection Series deleted successfully.");
  } catch (error) {
      console.error("Error deleting collection:", error);
  }

  const company1 = await generalFunctions.create_company("1");
  const company2 = await generalFunctions.create_company("2");
  const company3 = await generalFunctions.create_company("3");
  const company4 = await generalFunctions.create_company("4");
  const company5 = await generalFunctions.create_company("5");

  const user1 = await generalFunctions.create_user("sa",company1,1);
  const user2 = await generalFunctions.create_user("c1",company2,1);
  const user3 = await generalFunctions.create_user("c2",company2,0);
  const user4 = await generalFunctions.create_user("c3",company3,1);
  const user5 = await generalFunctions.create_user("c4",company4,1);
  const user6 = await generalFunctions.create_user("c5",company5,0);


  const accountant1 = await generalFunctions.create_accountant("a1");
  const accountant2 = await generalFunctions.create_accountant("a2");

  const admin1 = await generalFunctions.create_admin("ad1")

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

  const i1 = await generalFunctions.createItem(company2._id, 'i1', 'i1', 3, 0.5, 1,0.6)

  const w1 = await generalFunctions.createWarehouse(company2._id, 'w1', 'w1_l');
  const w2 = await generalFunctions.createWarehouse(company2._id, 'w2', 'w2_2');
  w2.active = 0;
  w2.registrationDate = '2024-06-10T18:22:57.852+00:00';
  await w2.save();

  const s1 = await generalFunctions.createSeries(company2._id, 's1');
  const s2 = await generalFunctions.createSeries(company2._id, 's2');
  s2.active = 0;
  await s2.save();


  console.log("----------   END ");

}
