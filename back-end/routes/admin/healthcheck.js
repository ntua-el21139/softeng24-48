const express = require('express');
const router = express.Router();

const healthcheckController = require('../../controllers/admin/healthcheckController');

//Define the GET route for healthcheck
router.get('/', healthcheckController.getHealthcheck);

//Export the router
module.exports = router;
