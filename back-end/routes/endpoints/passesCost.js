const express = require('express');
const router = express.Router();

const passesCostController = require('../../controllers/passesCostController');

//Define the GET route
router.get('/:tollOpID/:tagOpID/:date_from/:date_to', passesCostController.getPassesCost);

module.exports = router;