const express = require('express');
const router = express.Router();

const useCaseTwoController = require('../../../controllers/extra/useCaseTwoController');


router.get('/OpID', useCaseTwoController.getUseCaseTwo);

module.exports = router;