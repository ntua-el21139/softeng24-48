const express = require('express');
const router = express.Router();

const resetStationsController = require('../../../controllers/admin/resetStationsController');

router.post('/', resetStationsController.resetStations);

module.exports = router;    
