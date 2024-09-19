const express = require("express");
const router = express.Router();

require("dotenv").config();

const bcrypt = require("bcrypt");
var mongoose = require("mongoose");

//File with the paths
const path_constants = require("../../constantsPaths");

const passport = require("passport");

const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Node = require(path_constants.schemas.two.node);
const Client = require(path_constants.schemas.two.client);
const Company = require(path_constants.schemas.two.company);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Notification = require(path_constants.schemas.two.notification);
//Get General Functions

const generalFunctions = require(path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants
  .clientAccountantFunctions_folder.two);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   LOG IN */
router.get("/", Authentication.checkNotAuthenticated, (req, res) => {
  //FOR TEST START
  if (req.query.restartdb === "true") {
    create_users();
  }
  //FOR TEST END
  //generalFunctions.checkAccessRigts('.',req,res,data);
  //res.render('../views/log_in.ejs');
  res.render("." + path_constants.pages.log_in.view());
});
router.post(
  path_constants.pages.index.url,
  Authentication.checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: path_constants.pages.index.url,
    failureRedirect: path_constants.pages.log_in.url,
    failureFlash: true,
  })
);

module.exports = router;

//---------------TEST-------------------------------------------------
async function create_users() {
  await generalFunctions.drop_collection("Company");
  await generalFunctions.drop_collection("Node");
  await generalFunctions.drop_collection("users");
  await generalFunctions.drop_collection("item");
  await generalFunctions.drop_collection("Report");
  await generalFunctions.drop_collection("warehouses");
  await generalFunctions.drop_collection("series");
  await generalFunctions.drop_collection("persons");
  await generalFunctions.drop_collection("document");
  await generalFunctions.drop_collection("Notification");

  console.log("End Deleting -----");

  var data = {};
  var logo =
      "https://static.vecteezy.com/system/resources/previews/008/214/517/non_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg",
    data = {
      name: "Innovatech Solutions Ltd",
      logo: logo,
      signupcode: 1,
    };
  const company1 = await generalFunctions.create_company(data);
  company1.registrationDate = "2024-07-11T19:41:33.811+00:00";
  await company1.save();

  data = {
    name: "Global Synergy Inc",
    logo: logo,
    signupcode: 1,
  };
  const company2 = await generalFunctions.create_company(data);
  company2.license.used = 2;
  company2.license.bought = 2;
  await company2.save();

  data = {
    name: "Innovatech Solutions Ltd",
    logo: logo,
    signupcode: 1,
  };
  const company3 = await generalFunctions.create_company(data);

  data = {
    name: "TechPulse Enterprises",
    logo: logo,
    signupcode: 1,
  };
  const company4 = await generalFunctions.create_company(data);

  data = {
    name: "Pioneer Innovations",
    logo: logo,
    signupcode: 1,
  };
  const company5 = await generalFunctions.create_company(data);
  company5.status = "disabled";
  await company5.save();

  data = {
    type: "user",
    firstName: "John",
    lastName: "Doe",
    password: await bcrypt.hash("1", 10),
    email: "sa@sa",
    afm: "123456789",
    mydatakey: "key123456",
    company: company1,
    companyOwner: 1,
  };
  const user1 = await generalFunctions.create_user(data);

  data = {
    type: "user",
    firstName: "Alice",
    lastName: "Johnson",
    password: await bcrypt.hash("1", 10),
    email: "c1@c1",
    afm: "987654321",
    mydatakey: "key654321",
    company: company2,
    companyOwner: 1,
  };
  const user2 = await generalFunctions.create_user(data);

  data = {
    type: "user",
    firstName: "Alice",
    lastName: "Johnson",
    password: await bcrypt.hash("1", 10),
    email: "c2@c2",
    afm: "987654321",
    mydatakey: "key654321",
    company: company2,
    companyOwner: 0,
  };
  const user3 = await generalFunctions.create_user(data);

  data = {
    type: "user",
    firstName: "Emma",
    lastName: "Brown",
    password: await bcrypt.hash("1", 10),
    email: "c3@c3",
    afm: "223344556",
    mydatakey: "key987654",
    company: company3,
    companyOwner: 1,
  };
  const user4 = await generalFunctions.create_user(data);

  data = {
    type: "user",
    firstName: "Olivia",
    lastName: "Davis",
    password: await bcrypt.hash("1", 10),
    email: "c4@c4",
    afm: "667788990",
    mydatakey: "key123987",
    company: company4,
    companyOwner: 1,
  };
  const user5 = await generalFunctions.create_user(data);

  data = {
    type: "user",
    firstName: "Lucas",
    lastName: "Miller",
    password: await bcrypt.hash("1", 10),
    email: "c5@c5",
    afm: "998877665",
    mydatakey: "key321456",
    company: company5,
    companyOwner: 1,
  };
  const user6 = await generalFunctions.create_user(data);

  let text = "a1";
  data = {
    type: "accountant",
    firstName: text + "_fn",
    lastName: text + "_ln",
    password: await bcrypt.hash("1", 10),
    email: text + "@" + text,
    afm: text + "_afm",
    mydatakey: text + "_mdk",
  };
  const accountant1 = await generalFunctions.create_accountant(data);

  text = "a2";
  data = {
    type: "accountant",
    firstName: text + "_fn",
    lastName: text + "_ln",
    password: await bcrypt.hash("1", 10),
    email: text + "@" + text,
    afm: text + "_afm",
    mydatakey: text + "_mdk",
  };
  const accountant2 = await generalFunctions.create_accountant(data);

  data = {
    type: "admin",
    firstName: "admin_fn",
    lastName: "admin_ln",
    password: await bcrypt.hash("1", 10),
    email: "admin@admin",
  };
  const admin1 = await generalFunctions.create_admin(data);

  //self Acountant
  await clientAccountantFunctions.send_hiring_req_to_accountant(
    company1._id,
    user1._id,
    company1._id
  );
  // C2 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(
    company2._id,
    user2._id,
    accountant1._id,
    "relationship",
    "hiring"
  );
  await clientAccountantFunctions.relationship_accept_reject(
    company2._id,
    "executed"
  );
  // C3 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(
    company3._id,
    user4._id,
    accountant1._id
  );
  await clientAccountantFunctions.relationship_accept_reject(
    company3._id,
    "rejected"
  );
  // C4 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(
    company4._id,
    user5._id,
    accountant1._id
  );

  // C5 - A1
  await clientAccountantFunctions.send_hiring_req_to_accountant(
    company5._id,
    user6._id,
    accountant1._id
  );
  await clientAccountantFunctions.fire_accountant(
    company5._id,
    user6._id,
    accountant1._id
  );

  data = {
    type: "sale",
    firstName: "p1",
    lastName: "p1ln",
    email: "p1@p1.com",
    afm: "111",
    phone: "222",
    company: company2._id,
  };
  const person1 = await generalFunctions.create_person(data);

  data = {
    type: "buy",
    firstName: "p2",
    lastName: "p2ln",
    email: "p2@p2.com",
    afm: "222",
    phone: "333",
    company: company2._id,
  };
  const person2 = await generalFunctions.create_person(data);

  data = {
    type: "sale",
    firstName: "p3",
    lastName: "p3ln",
    email: "p3@p3.com",
    afm: "333",
    phone: "444",
    company: company2._id,
  };
  const person3 = await generalFunctions.create_person(data);

  data = {
    companyID: company2._id,
    title: "i1",
    description: "i1",
    price_r: 100,
    price_w: 50,
    discount_r: 10,
    discount_w: 15,
    tax_r: 24,
    tax_w: 0,
  };
  const i1 = await generalFunctions.createItem(data);
  data = {
    companyID: company2._id,
    title: "i2",
    description: "i2",
    price_r: 200,
    price_w: 100,
    discount_r: 20,
    discount_w: 10,
    tax_r: 10,
    tax_w: 5,
  };
  const i2 = await generalFunctions.createItem(data);
  data = {
    companyID: company2._id,
    title: "i3",
    description: "i3",
    price_r: 500,
    price_w: 200,
    discount_r: 10,
    discount_w: 20,
    tax_r: 20,
    tax_w: 10,
  };
  const i3 = await generalFunctions.createItem(data);
  await i3.save();

  data = {
    companyID: company2._id,
    title: "series1b",
    acronym: "S1",
    type: "buy",
    sealed: 1,
  };
  const s1 = await generalFunctions.createSeries(data);
  data = {
    companyID: company2._id,
    title: "series2s",
    acronym: "S2",
    type: "sale",
    sealed: 0,
  };
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
      { quantity: 1, tax: 5, item: i3._id, discount: 0, price_of_unit: 30 },
    ],
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
      { quantity: 1, tax: 5, item: i2._id, discount: 0, price_of_unit: 30 },
    ],
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
      { quantity: 1, tax: 5, item: i2._id, discount: 0, price_of_unit: 30 },
    ],
  };
  const doc3 = await generalFunctions.create_doc(data);

  data = {
    companyID: company2._id,
    title: "w1",
    location: "w1_l",
  };
  const w1 = await generalFunctions.createWarehouse(data);

  data = {
    companyID: company2._id,
    title: "w2",
    location: "w2_l",
  };
  const w2 = await generalFunctions.createWarehouse(data);
  w2.active = 0;
  w2.registrationDate = "2024-06-10T18:22:57.852+00:00";
  await w2.save();

  console.log("----------   END ");
}
