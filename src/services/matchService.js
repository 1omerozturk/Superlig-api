const cheerio = require('cheerio')
const { fetchData } = require('../utils/httpClient') // fetchData'yı import ediyoruz
const teamLogos = require('../data/teamLogos')
const { MATCHES_URL } = require('../config/constant')

class MatchService {
  async getMatchesForWeek(weekNumber = null) {
    // Eğer bir hafta numarası gönderilmişse, direkt o haftanın URL'sini oluştur
    const url = weekNumber ? `${MATCHES_URL}&hafta=${weekNumber}` : MATCHES_URL
    const html = await fetchData(url)
    const $ = cheerio.load(html, { decodeEntities: false })

    // Sadece weekNumber gönderilmediğinde currentWeek'i bul
    const currentWeek =
      weekNumber ||
      parseInt(
        $('#ctl00_MPane_m_198_12491_ctnr_m_198_12491_hs_Tab2').text().trim(),
      ) ||
      null

    const now = new Date()
    const currentDate = now
      .toLocaleDateString('tr-TR')
      .split('.')
      .reverse()
      .join('-')
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const matches = []
    let allMatchesCompleted = true

    $('.haftaninMaclariTr').each((_, row) => {
      const date = $(row)
        .find('.haftaninMaclariTarih span:first-child')
        .text()
        .trim()
      const time = $(row)
        .find('.haftaninMaclariTarih span:last-child')
        .text()
        .trim()
      const homeTeam = $(row).find('.haftaninMaclariEv span').text().trim()
      const awayTeam = $(row)
        .find('.haftaninMaclariDeplasman span')
        .text()
        .trim()
      let score = ''

      const scoreSpans = $(row).find('.haftaninMaclariSkor span')
      if (scoreSpans.length === 2) {
        const homeScore = $(scoreSpans[0]).text().trim()
        const awayScore = $(scoreSpans[1]).text().trim()

        if (homeScore && awayScore) {
          score = `${homeScore} - ${awayScore}`
        } else if (homeScore === '-' || awayScore === '-') {
          allMatchesCompleted = false
          score = '0'
        } else {
          const matchDate = date.split('.').reverse().join('-')
          const [matchHour, matchMinute] = time.split(':').map(Number)

          if (matchDate === currentDate) {
            const matchTimeInMinutes = matchHour * 60 + matchMinute
            const currentTimeInMinutes = currentHour * 60 + currentMinute
            const timeDifference = currentTimeInMinutes - matchTimeInMinutes

            if (timeDifference >= 0 && timeDifference <= 120) {
              score = '1'
              allMatchesCompleted = false
            } else if (timeDifference < 0) {
              score = '0'
              allMatchesCompleted = false
            }
          } else {
            score = '0'
            allMatchesCompleted = false
          }
        }
      }

      const matchData = {
        date,
        time,
        homeTeam,
        homeLogo: teamLogos[homeTeam] || '',
        score,
        awayTeam,
        awayLogo: teamLogos[awayTeam] || '',
      }

      matches.push(matchData)
    })

    // Eğer tüm maçlar tamamlanmışsa ve bir sonraki hafta varsa, bir sonraki haftayı çek
    if (!weekNumber && allMatchesCompleted && currentWeek && currentWeek < 34) {
      return await this.getMatchesForWeek(currentWeek + 1)
    }

    return matches
  }

  async getMatchesDetail(weekNumber, teamId) {
    const url = `${MATCHES_URL}&hafta=${weekNumber}`
    const baseUrl = 'https://www.tff.org/'
    const html = await fetchData(url)
    const $ = cheerio.load(html, { decodeEntities: false })

    let links = []
    $('td.haftaninMaclariSkor a').each((i, elem) => {
      const href = $(elem).attr('href')
      if (href) {
        links.push(baseUrl + href)
      }
    })

    return this.getMatchDetailsFromLink(links[teamId])
  }

  async getMatchDetailsFromLink(link) {
    const response = await fetchData(link)
    const html = await response.text()
    const $ = cheerio.load(html, { decodeEntities: false })

    const team1Score = $('p.MacDetaySayi span')[0].children[0].data.trim()
    const team2Score = $('p.MacDetaySayi span')[1].children[0].data.trim()
    const score = `${team1Score}-${team2Score}`

    const team1 = {
      name: $('td.TakimAdi.altGriCizgi a[id$="lnkTakim1"]').text(),
      logo: $('td.TakimAdi.altGriCizgi a[id$="imgTakim1Logo"] img').attr('src'),
    }

    const team2 = {
      name: $('td.TakimAdi.altGriCizgi a[id$="lnkTakim2"]').text(),
      logo: $('td.TakimAdi.altGriCizgi a[id$="imgTakim2Logo"] img').attr('src'),
    }

    let goals = []
    $(
      'td.MacDetayMiniBaslik:has(img[src="App_Themes/TFF_Default/Images/design/iconGoller.gif"])',
    )
      .parent()
      .nextUntil('tr:has(td.MacDetayMiniBaslik)')
      .each((i, elem) => {
        const goal = $(elem).find('a').text().trim()
        if (goal) {
          goals.push(goal)
        }
      })
    console.log({
      score,
      team1,
      team2,
      goals,
    })
    return {
      score,
      team1,
      team2,
      goals,
    }
  }
}

module.exports = new MatchService()
