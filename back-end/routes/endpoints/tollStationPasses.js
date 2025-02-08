const express = require('express');
const router = express.Router();

const tollStationPassesController = require('../../controllers/tollStationPassesController');

//Define the GET route
router.get('/:tollStationID/:date_from/:date_to', tollStationPassesController.getTollStationPasses);

//Export the router 
module.exports = router;