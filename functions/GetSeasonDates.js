import puppeteer, { Keyboard } from "puppeteer";

export default async function getSeasonDates(season) {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    let currentYears = season;
    const page = await browser.newPage();
    await page.goto(`https://en.wikipedia.org/wiki/${currentYears}_NBA_season`, {
        waitUntil: 'domcontentloaded',
    })
    const cell_headers = await page.evaluate(() => {
        const ths = Array.from(document.querySelectorAll('table.infobox tr th'))
        return ths.map(th => th.innerText)
    })
    const cell_data = await page.evaluate(() => {  
        const tds = Array.from(document.querySelectorAll('table.infobox tr td'))
        return tds.map(td => td.innerText)
      });
     
    let dates = cell_data[cell_headers.indexOf('Duration') - 1].split('\n')
    let seasonStart = new Date(dates[0].split('–')[0])
    let seasonEnd = new Date(dates[0].split('-')[1])

    return [page, seasonStart, seasonEnd]
} 
