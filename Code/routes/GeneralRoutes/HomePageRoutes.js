const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

const User = require(path_constants.schemas.two.user);
const Node = require(path_constants.schemas.two.node);

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);


router.get('/', (req, res) => {
        res.render('.'+path_constants.pages.homepage.view());
});

module.exports = router;