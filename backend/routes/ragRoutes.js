const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { reindex, ask } = require('../controllers/ragController');

const router = express.Router();

router.use(authenticateToken);

router.post('/reindex', reindex);
router.post('/ask', ask);

module.exports = router;


