const express = require('express');
const router = express.Router();
const { getTopScorers } = require('../controller/scorerController');

router.get('/', getTopScorers);

module.exports = router;