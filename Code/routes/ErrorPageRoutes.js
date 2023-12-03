const express = require("express");
const router = express.Router();

/*--------   ERROR */
router.get('/', (req, res) => {
    res.render('general/error_page.ejs');
});

module.exports = router;