const express = require("express");
const router = express.Router();

require('dotenv').config();

const bcrypt = require('bcrypt');
var mongoose = require('mongoose');

//File with the paths
const path_constants = require('../../constantsPaths');

const passport = require('passport');

const Accountant  = require(path_constants.schemas.two.accountant);
const Review  = require(path_constants.schemas.two.review);
const Node = require(path_constants.schemas.two.node);
const Client  = require(path_constants.schemas.two.client);
const Company  = require(path_constants.schemas.two.company);
const User = require(path_constants.schemas.two.user);
const Item  = require(path_constants.schemas.two.item);


const Notification = require(path_constants.schemas.two.notification);

const clientAccountantFunctions = require("../../ClientAccountantFunctions");

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

  await generalFunctions.drop_collection("Company");
  await generalFunctions.drop_collection("Node");
  await generalFunctions.drop_collection("users");
  await generalFunctions.drop_collection("item");
  await generalFunctions.drop_collection("Report");
  await generalFunctions.drop_collection("warehouses");
  await generalFunctions.drop_collection("series");
  await generalFunctions.drop_collection("persons");
  console.log("End Deleting -----");

  const company1 = await generalFunctions.create_company("c1",'logo',1);
  company1.registrationDate = '2024-07-11T19:41:33.811+00:00';
  await company1.save();
  const company2 = await generalFunctions.create_company("c2",'logo',1);
  company2.license.used = 2;
  company2.license.bought = 2;
  await company2.save();

  const person1 =  await generalFunctions.create_person("customer","p1","p1ln","p1@p1.com",111,222,company2._id);
  const person2 =  await generalFunctions.create_person("supplier","p2","p2ln","p2@p2.com",1112,2223,company2._id);



  const company3 = await generalFunctions.create_company("c3",'logo',1);
  const company4 = await generalFunctions.create_company("c4",'logo',1);
  const company5 = await generalFunctions.create_company("c5",'logo',1);
  company5.status = "disabled";
  await company5.save();

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

  const i1 = await generalFunctions.createItem(company2._id, 'i1', 'i1', 3, 0.5, 1,0.6);
  const i2 = await generalFunctions.createItem(company2._id, 'i2', 'i2', 3, 0.5, 1,0.6);
  i2.active = 0;
  await i2.save();
  const i3 = await generalFunctions.createItem(company2._id, 'i3', 'i3', 4, 0.5, 4,0.1);


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
