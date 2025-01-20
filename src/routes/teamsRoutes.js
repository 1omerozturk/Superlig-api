const express = require('express')
const { getTeams, getTeamLineUp,getTeamFixture } = require('../controller/teamController')
const router = express.Router()

router.get('/', getTeams)
router.get('/lineup/:teamId', getTeamLineUp)
router.get('/fixture/:teamId',getTeamFixture)

module.exports = router
