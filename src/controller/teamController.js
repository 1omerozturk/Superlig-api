const teamService = require('../services/teamService')

const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getTeams()
    return res.json(teams)
  } catch (error) {
    next(error)
  }
}

const getTeamLineUp = async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.teamId)
    const teamData = await teamService.getTeamLineUp(teamId)
    return res.json(teamData)
  } catch (error) {
    next(error)
  }
}

const getTeamFixture = async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.teamId)
    const teamData = await teamService.getTeamFixture(teamId)
    return res.json(teamData)
  } catch (error) {
    next(error)
  }
}

module.exports = { getTeams, getTeamLineUp,getTeamFixture }
