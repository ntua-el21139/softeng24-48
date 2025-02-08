const express = require('express');
const router = express.Router();

// Placeholder for the controller function which will be implemented later
const tollStationPassesController = require('../../controllers/tollStationPassesController');

//Define the GET route
router.get('/:tollStationID/:date_from/:date_to', tollStationPassesController.getTollStationPasses);

//Export the router 
module.exports = router;