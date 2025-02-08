const express = require('express');
const router = express.Router();

const chargesByController = require('../../controllers/chargesByController');


//Define the GET route
router.get('/:tollOpID/:date_from/:date_to', chargesByController.getChargesBy);

module.exports = router;
