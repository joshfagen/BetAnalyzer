import puppeteer from "puppeteer"

export default async function getGamesObjectArray(page)
const table = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('div.usertext-body div.md table tr td'))
        return rows.map(row => row.innerText)
    })

        //extract table data
    let gamesTable = table.splice(table.indexOf(`${currentMonth}/${currentDay}`))
    let gamesObjectArray = []
    let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    let i = 0
    while(i < gamesTable.length) {
        gamesObjectArray.push(gamesTable.slice(i, gamesTable.indexOf(`${currentMonth}/${currentDay}`, i+1)))
        gamesTable.indexOf(`${currentMonth}/${currentDay}`, i+1) == -1 ? 
            i = gamesTable.length : i = gamesTable.indexOf(`${currentMonth}/${currentDay}`, i+1)
    }

    return gamesObjectArray