const express = require('express');
const router = express.Router();

const resetpassesController = require('../../../controllers/admin/resetpassesController.js');

// Define the POST route for resetpasses
router.post('/', resetpassesController.resetpasses);

// Export the router
module.exports = router;
