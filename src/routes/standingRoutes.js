const express = require('express');
const router = express.Router();
const { getStandings } = require('../controller/standingController');

router.get('/', getStandings);

module.exports = router;