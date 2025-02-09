const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer with file filter
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        // Check mime type
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Only text/csv files are allowed'), false);
        }
        cb(null, true);
    }
});

const addpassesController = require('../../../controllers/admin/addpassesController.js');

// 'file' is the field name expected in the form data
router.post('/', upload.single('file'), addpassesController.addpasses);

module.exports = router;