const express = require('express');
const router = express.Router();
//const { verifyToken, isAdmin } = require('../middleware/auth');

// Import routes
const tollStationPasses = require('./endpoints/tollStationPasses');
const passAnalysis = require('./endpoints/passAnalysis');
const passesCost = require('./endpoints/passesCost');
const chargesBy = require('./endpoints/chargesBy');
const healthcheck = require('./endpoints/admin/healthcheck');
const resetstations = require('./endpoints/admin/resetstations');
const resetpasses = require('./endpoints/admin/resetpasses');
const addpasses = require('./endpoints/admin/addpasses');
const mapSupply = require('./endpoints/extra/mapSupply')
const useCaseTwo = require('./endpoints/extra/useCaseTwo');
const deptOffsetting = require('./endpoints/deptOffsetting');
const fetchUser = require('./endpoints/extra/fetchUser');

// Define base paths for each route
router.use('/tollStationPasses', tollStationPasses);
router.use('/passAnalysis', passAnalysis);
router.use('/passesCost', passesCost);
router.use('/chargesBy', chargesBy);
router.use('/admin/healthcheck', healthcheck);
router.use('/admin/resetstations', resetstations);
router.use('/admin/resetpasses', resetpasses);
router.use('/admin/addpasses', addpasses);
router.use('/extra/mapSupply', mapSupply);
router.use('/extra/useCaseTwo', useCaseTwo);
router.use('/deptOffsetting', deptOffsetting);
router.use('/extra/fetchUser', fetchUser);

module.exports = router;
