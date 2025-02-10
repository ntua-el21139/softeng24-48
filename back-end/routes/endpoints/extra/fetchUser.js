const express = require('express');
const router = express.Router();

const fetchUserController = require('../../../controllers/extra/fetchUserController');


router.get('/:username/:password', fetchUserController.getFetchUser);

module.exports = router;
