const cron = require('cron')
const https = require('https')

const job = new cron.CronJob('*/14 * * * *', function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log('GET request sent successfully')
      else console.error('GET request failed', res.statusCode)
    })
    .on('error', (e) => console.error('Error while sending request', e))
})

module.exports=job;