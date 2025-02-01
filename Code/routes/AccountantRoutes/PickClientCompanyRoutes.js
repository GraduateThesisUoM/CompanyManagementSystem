const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require("../../constantsPaths");

//Models
const Client = require(path_constants.schemas.two.client);

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   WORKING */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const clients = await Client.find({}); // Fetch all accountants from the database
      clients.sort((a, b) => a.firstName.localeCompare(b.firstName));

      res.render("accountant_pages/create_page.ejs", {
        user: req.user,
        clients: clients,
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});
module.exports = router;
