const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { getReports, getReport } = require('../controllers/reportController');

router.use(authenticate);
router.get('/', getReports);
router.get('/:id', getReport);

module.exports = router;
