const express = require('express');
const router = express.Router();

const mapSupplyController = require('../../../controllers/extra/mapSupplyController');

router.get('/', mapSupplyController.getMapSupply);

module.exports = router;



