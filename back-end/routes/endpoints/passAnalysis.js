const express = require('express');
const router = express.Router();

const passAnalysisController = require('../../controllers/passAnalysisController');

//Define the GET route 
router.get('/:stationOpID/:tagOpID/:date_from/:date_to', passAnalysisController.getPassAnalysis);

module.exports = router;