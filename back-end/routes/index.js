const express = require('express');
const router = express.Router();

// Import routes
const tollStationPasses = require('./endpoints/tollStationPasses');
const passAnalysis = require('./endpoints/passAnalysis');
const passesCost = require('./endpoints/passesCost');
const chargesBy = require('./endpoints/chargesBy');
const healthcheck = require('./admin/healthcheck');

// Define base paths for each route
router.use('/tolls/passes', tollStationPasses);
router.use('/passAnalysis', passAnalysis);
router.use('/passesCost', passesCost);
router.use('/chargesBy', chargesBy);
router.use('/admin/healthcheck', healthcheck);

module.exports = router;
