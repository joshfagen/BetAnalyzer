import puppeteer, { Keyboard } from "puppeteer";

export default async function accessViaGoogle(page, currentDateRightFormat, currentMonth, currentDay, currentYear){
    await page.goto('https://google.com/', {
            waitUntil: 'domcontentloaded',
        });

        //search for daily odds thread
        await page.type('input[name="q"]', `NBA Daily ${currentDateRightFormat}`)
        await page.keyboard.press('Enter', {
            waitUntil: 'domcontentloaded',
        })

        await page.waitForNavigation({
            waitUntil: 'networkidle2',
        });
        
        
        let hrefs = await page.$$eval('a', as => as.map(a => a.href))
        let dateString = `${currentMonth}${currentDay}${currentYear}`
        let dailyLink = ''  
        for(let i = 0; i < hrefs.length; i++){
            if(hrefs[i].includes(`nba_daily_${dateString}_`)){
                dailyLink = hrefs[i]
                break;
            }
        }
        //navigate to daily odds thread
        await page.goto(dailyLink, {
            waitUntil: 'domcontentloaded',
        })
}