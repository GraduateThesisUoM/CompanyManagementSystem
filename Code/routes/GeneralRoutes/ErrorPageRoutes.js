const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");


/*--------   ERROR */
router.get('/', (req, res) => {
    res.render(path_constants.pages.error.view());
});

module.exports = router;