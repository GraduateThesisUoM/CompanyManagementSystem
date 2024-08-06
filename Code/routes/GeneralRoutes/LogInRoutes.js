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
  await generalFunctions.drop_collection("document");

  console.log("End Deleting -----");

  const company1 = await generalFunctions.create_company("c1",'logo',1);
  company1.registrationDate = '2024-07-11T19:41:33.811+00:00';
  await company1.save();
  const company2 = await generalFunctions.create_company("c2",'logo',1);
  company2.license.used = 2;
  company2.license.bought = 2;
  await company2.save();

  const person1 =  await generalFunctions.create_person("sale","p1","p1ln","p1@p1.com",111,222,company2._id);
  const person2 =  await generalFunctions.create_person("buy","p2","p2ln","p2@p2.com",1112,2223,company2._id);
  const person3 =  await generalFunctions.create_person("sale","p3","p3ln","p3@p3.com",33,333,company2._id);

  const user2 = await generalFunctions.create_user("c1",company2,1);

  var data = {
    companyID: company2._id,
    title : 'i1',
    description : 'i1',
    price_r :100,
    price_w :10,
    discount_r :10,
    discount_w :3,
    tax_r :24,
    tax_w :0
  }
  const i1 = await generalFunctions.createItem(data);
  data = {
    companyID: company2._id,
    title : 'i2',
    description : 'i2',
    price_r :200,
    price_w :20,
    discount_r :20,
    discount_w :60,
    tax_r :10,
    tax_w :0
  }
  const i2 = await generalFunctions.createItem(data);
  data = {
    companyID: company2._id,
    title : 'i3',
    description : 'i3',
    price_r :100,
    price_w :50,
    discount_r :10,
    discount_w :20,
    tax_r :20,
    tax_w :10
  }
  const i3 = await generalFunctions.createItem(data);
  await i3.save();

  data = {
    companyID: company2._id,
    title :'series1b',
    acronym : 'S1',
    type : 'buy'
  }
  const s1 = await generalFunctions.createSeries(data);
  data = {
    companyID: company2._id,
    title :'series2s',
    acronym : 'S2',
    type : 'sale'
  }
  const s2 = await generalFunctions.createSeries(data);

  data = {
    company: company2._id,
    sender: user2._id,
    receiver: person1._id,
    type: "sale",
    series: s2._id,
    generalDiscount: 10,
    invoiceData: [
        { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
        { quantity: 1, tax: 5, item: i3._id, discount: 0, price_of_unit: 30 }
      ]
};

  const doc1 = await generalFunctions.create_doc(data);

  data = {
    company: company2._id,
    sender: user2._id,
    receiver: person1._id,
    type: "sale",
    series: s2._id,
    generalDiscount: 10,
    invoiceData: [
        { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
        { quantity: 1, tax: 5, item: i2._id, discount: 0, price_of_unit: 30 }
      ]
};

  const doc2 = await generalFunctions.create_doc(data);

  data = {
    company: company2._id,
    sender: user2._id,
    receiver: person2._id,
    type: "buy",
    series: s1._id,
    generalDiscount: 10,
    invoiceData: [
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 2, tax: 5, item: i1._id, discount: 1, price_of_unit: 20 },
      { quantity: 1, tax: 5, item: i2._id, discount: 0, price_of_unit: 30 }
    ]
};

  const doc3 = await generalFunctions.create_doc(data);

  const company3 = await generalFunctions.create_company("c3",'logo',1);
  const company4 = await generalFunctions.create_company("c4",'logo',1);
  const company5 = await generalFunctions.create_company("c5",'logo',1);
  company5.status = "disabled";
  await company5.save();

  const user1 = await generalFunctions.create_user("sa",company1,1);
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


  const w1 = await generalFunctions.createWarehouse(company2._id, 'w1', 'w1_l');
  const w2 = await generalFunctions.createWarehouse(company2._id, 'w2', 'w2_2');
  w2.active = 0;
  w2.registrationDate = '2024-06-10T18:22:57.852+00:00';
  await w2.save();
  


  console.log("----------   END ");

}
