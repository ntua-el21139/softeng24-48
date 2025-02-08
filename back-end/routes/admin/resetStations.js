const express = require('express');
const router = express.Router();

const resetstationsController = require('../../controllers/admin/resetstationsController');

router.post('/', resetstationsController.resetstations);

module.exports = router;    
