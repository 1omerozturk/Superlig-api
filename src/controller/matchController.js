const matchService = require('../services/matchService')

const getMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getMatchesForWeek()
    res.json(matches)
  } catch (error) {
    next(error)
  }
}

const getMatchesWeek = async (req, res, next) => {
  try {
    const week = parseInt(req.params.week)
    const matches = await matchService.getMatchesForWeek(week)
    res.json(matches)
  } catch (error) {
    next(error)
  }
}

const getMatchesDetail = async (req, res, next) => {
  try {
    const week = parseInt(req.params.week)
    const teamId = parseInt(req.params.teamId)
    const matches = await matchService.getMatchesDetail(week, teamId)
    res.json(matches)
  } catch (error) {
    next(error)
  }
}

module.exports = { getMatches, getMatchesWeek, getMatchesDetail }
