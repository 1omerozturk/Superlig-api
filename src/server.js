const express = require('express')
const { PORT } = require('./config/constant')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')
// Import routes
const matchRoutes = require('./routes/matchRoutes')
const standingRoutes = require('./routes/standingRoutes')
const scorerRoutes = require('./routes/scorerRoutes')
const teamsRoutes = require('./routes/teamsRoutes')
const job = require('./services/cron')

const app = express()

// Cron function
job.start()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/get-matches', matchRoutes)
app.use('/standings', standingRoutes)
app.use('/top-scorers', scorerRoutes)
app.use('/get-teams', teamsRoutes)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`http://localhost:${PORT}/get-teams`)
})
