const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Import routes
const tollStationPasses = require('./endpoints/tollStationPasses');
const passAnalysis = require('./endpoints/passAnalysis');
const passesCost = require('./endpoints/passesCost');
const chargesBy = require('./endpoints/chargesBy');
const healthcheck = require('./endpoints/admin/healthcheck');
const resetstations = require('./endpoints/admin/resetstations');
const resetpasses = require('./endpoints/admin/resetpasses');

// Define base paths for each route
router.use('/tollStationPasses', tollStationPasses);
router.use('/passAnalysis', passAnalysis);
router.use('/passesCost', passesCost);
router.use('/chargesBy', chargesBy);
router.use('/admin/healthcheck', healthcheck);
router.use('/admin/resetstations', verifyToken, isAdmin, resetstations);
router.use('/admin/resetpasses', verifyToken, isAdmin, resetpasses);
module.exports = router;
