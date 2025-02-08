const express = require('express');
const router = express.Router();

const resetstationsController = require('../../../controllers/admin/resetstationsController.js');

router.post('/', resetstationsController.resetstations);

module.exports = router;    
