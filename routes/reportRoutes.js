const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const ReportController = require('../controllers/reportController');

router.post('/analyze', upload.single('report'), ReportController.processReport);
module.exports = router;