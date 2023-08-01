import puppeteer, { Keyboard } from "puppeteer";
import * as dotenv from "dotenv";

export default async function redditLogin(page, currentDateRightFormat, currentMonth, currentDay, currentYear) {
    await page.goto('https://old.reddit.com/', {
            waitUntil: 'domcontentloaded',
        });

        if(currentMonth == 10 && currentDay == 18) {
            await page.type('input[name="user"]', dotenv.config().parsed.USER);
            await page.type('input[name="passwd"]', dotenv.config().parsed.PASSWORD);
        
            const [button] = await page.$x("//button[contains(., 'login')]");
            if (button) {
                await Promise.all([
                    button.click(),
                    page.waitForNavigation({waitUntil: 'networkidle2'})
                ]);
            }
        }
        

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
        if(currentMonth == 2 && currentDay == 9 && currentYear == '23'){
            //Thread for this date wasn't showing up on Reddit search for some reason
            return 'https://old.reddit.com/r/sportsbook/comments/10xk9cb/nba_daily_2923_thursday/'
        } else {
            return dailyLink
        }
        

        
}
