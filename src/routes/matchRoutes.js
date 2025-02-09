const express = require('express');
const router = express.Router();
const { getMatches, getMatchesWeek,getMatchesDetail } = require('../controller/matchController');

router.get('/:week', getMatchesWeek); // Belirli bir haftanın verilerini çeker
router.get('/', getMatches); // Güncel tarih verilerini çeker
router.get('/:week/:teamId', getMatchesDetail)

module.exports = router;
