const express = require('express');
const router = express.Router();

const deptOffsettingController = require('../../controllers/deptOffsettingController');


router.get('/:credential/:date', deptOffsettingController.getDeptOffsetting);

module.exports = router;
