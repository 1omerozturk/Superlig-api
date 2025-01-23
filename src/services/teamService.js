const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const { fetchData } = require('../utils/httpClient')
const { teamLogos } = require('../data/teamLogos')
const { TEAMS_URL } = require('../config/constant')

class TeamService {
  async getTeams() {
    const html = await fetchData(TEAMS_URL)
    if (!html) {
      throw new Error('Boş HTML döndü')
    }

    const $ = cheerio.load(html, { decodeEntities: false })
    const teams = []
    const teamNames = []
    const teamLogos = []

    $('td').each((index, element) => {
      const teamName = $(element).text().trim()
      teamNames.push(teamName)
    })
    $('td a img').each((index, element) => {
      const teamLogo = $(element).attr('src')
      teamLogos.push(teamLogo)
    })
    $('td a').each((index, element) => {
      const teamLink = $(element).attr('href')
      if (!teamLink) return

      teams.push({
        id:index,
        name: teamNames[index],
        url: 'https://www.tff.org/' + teamLink,
        logo: teamLogos[index],
      })
    })

    return teams
  }

  async getTeamLineUp(id) {
    const teams = await this.getTeams()
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/chromium'
    });
    const page = await browser.newPage()
    await page.goto(teams[id].url, { waitUntil: 'networkidle2' })
    await page.click('#ctl00_MPane_m_438_196_ctnr_m_438_196_btnAra')
    await page.waitForSelector('table.MasterTable_TFF_Contents')
    const html = await page.content()
    await browser.close()
    const $ = cheerio.load(html, { decodeEntities: false })
    const teamLineUp = []
    const tableRows = $('table.MasterTable_TFF_Contents tbody tr')
    tableRows.each((index, element) => {
      const name = $(element).find('td').eq(0).text().trim()
      teamLineUp.push({
        id: index,
        name: name,
      })
    })
    // console.log(teamLineUp)
    return teamLineUp
  }

  async getTeamFixture(id) {
    const teams = await this.getTeams();
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/chromium'
    });
    const page = await browser.newPage();
    
    await page.goto(teams[id].url, { waitUntil: 'networkidle2' });
  
    // Ekstra bekleme süresi ekleyin
    await page.waitForSelector('table');
    
    await page.click('#ctl00_MPane_m_438_398_ctnr_m_438_398_bntAra');
    await page.waitForSelector('table.MasterTable_TFF_Contents');
    
    let teamFixture = [];
    let hasNextPage = true;
    
    while (hasNextPage) {
      const html = await page.content();
      const $ = cheerio.load(html, { decodeEntities: false });
      const tableRows = $('table.MasterTable_TFF_Contents tbody tr');
      
      tableRows.each((index, element) => {
        const home = $(element).find('td').eq(1).text().trim();
        const result = $(element).find('td').eq(2).text().trim();
        const away = $(element).find('td').eq(3).text().trim();
        const date = $(element).find('td').eq(4).text().trim();
        const org = $(element).find('td').eq(5).text().trim();
        
        teamFixture.push({
          id: teamFixture.length + 1,
          home: home,
          away: away,
          date: date,
          result: result,
          organization: org,
        });
      });
      
      const nextPageButton = await page.$('a[title="Next page"]');
      if (nextPageButton) {
        await nextPageButton.click();
        await page.waitForSelector('table.MasterTable_TFF_Contents');
      } else {
        hasNextPage = false;
      }
    }
    
    await browser.close();
    return teamFixture;
  }
  
}

module.exports = new TeamService()
