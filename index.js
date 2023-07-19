import puppeteer, { Keyboard } from "puppeteer";
import * as dotenv from "dotenv";
import * as fileSystem from 'fs-extra';
import collectData from './functions/CollectData.js';

const getLines = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    let currentYears = '2022-23'
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
    let teamTracker = {}
    let allGamedays = []
    // For Loop Should Start Here
    //  currentDate = add i days to seasonStart until seasonEnd
    let currentDate = seasonStart
    
    currentDate = new Date(currentDate.toDateString())
    seasonEnd = new Date(seasonEnd.toDateString())
    while(currentDate != seasonEnd) {
        
        let currentMonth = currentDate.getMonth() + 1;
        let currentDay = currentDate.getDate();
        let currentYear = currentDate.getFullYear().toString().slice(-2,);
        let currentDateRightFormat = `${currentMonth}/${currentDay}/${currentYear}`
        console.log(currentDateRightFormat)
        
        // go to Reddit and login
        
        await page.goto('https://old.reddit.com/', {
            waitUntil: 'domcontentloaded',
        });

        if(allGamedays.length == 0) {
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
        await page.goto(dailyLink, {
            waitUntil: 'domcontentloaded',
        })
    
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

        //build data object for each game, push to sameDayGames array
        let gameDay = {}
        gameDay.general = {}
        gameDay.general.date = currentDate
        gameDay.general.dayOfWeek = currentDate.getDay()
        gameDay.general.dayOfWeekName = weekdays[currentDate.getDay()]
        gameDay.sameDayGames = []
        for(let i = 0; i < gamesObjectArray.length; i++){
            let gameData = {}
            gameData.general = {}
            gameData.prediction = {}
            gameData.actual = {}
            gameData.results = {}
            let currentGame = gamesObjectArray[i]
            gameData.general.date = currentGame[0]
            gameData.general.away = currentGame[1]
            gameData.general.home = currentGame[6]
            parseInt(currentGame[2]) > 100 ? 
                gameData.prediction.fav = 'H' : gameData.prediction.fav = 'A'
            gameData.prediction.fav == 'H' ?
                gameData.prediction.dog = 'A' : gameData.prediction.dog = 'H'
            gameData.prediction.awayML = parseInt(currentGame[2])
            gameData.prediction.homeML = parseInt(currentGame[7])
            gameData.prediction.spread = parseFloat(currentGame[3].slice(1, currentGame[3].indexOf(' ')))
            gameData.prediction.awaySpreadPays = parseInt(currentGame[3].slice(currentGame[3].indexOf(' ') + 1))
            gameData.prediction.homeSpreadPays = parseInt(currentGame[8].slice(currentGame[8].indexOf(' ') + 1))
            gameData.prediction.fav == 'H' ? 
                (gameData.prediction.favSpreadPays = gameData.prediction.homeSpreadPays, gameData.prediction.dogSpreadPays = gameData.prediction.awaySpreadPays) : 
                (gameData.prediction.dogSpreadPays = gameData.prediction.awaySpreadPays, gameData.prediction.favSpreadPays = gameData.prediction.homeSpreadPays)
            gameData.prediction.total = parseFloat(currentGame[4].slice(1, currentGame[4].indexOf(' ')))
            gameData.prediction.overPays = parseInt(currentGame[4].slice(currentGame[4].indexOf(' ') + 1))
            gameData.prediction.underPays = parseInt(currentGame[4].slice(currentGame[9].indexOf(' ') + 1))
            gameData.prediction.favScoreprediction = Math.round(gameData.prediction.total / 2 + gameData.prediction.spread / 2)
            gameData.prediction.dogScoreprediction = Math.round(gameData.prediction.total / 2 - gameData.prediction.spread / 2)
            gameData.prediction.predictionScore = `${gameData.prediction.favScoreprediction} - ${gameData.prediction.dogScoreprediction}`

            gameDay.sameDayGames.push(gameData)
        }
    
        let espnDate = `20${currentYear}${currentMonth}${currentDay}`
        //Go to ESPN.com and add results data to games.
        await page.goto(`https://www.espn.com/nba/scoreboard/_/date/${espnDate}`, {
            waitUntil: 'domcontentloaded',
        })
        //Match Games according to teams
        const gameModules = await page.evaluate(() => {
            const cells = Array.from(document.querySelectorAll('.ScoreboardScoreCell'))
            return cells.map(cell => cell.innerHTML)
        })
        
        //clean up game data HTML, and put in new array
        let gameModulesArray = []
        for(let i = 0; i < gameModules.length; i++) {
            
            let initialArray = gameModules[i].split('<')
            let revisedString = initialArray.join('tag!!!<')
            gameModulesArray.push(revisedString.split('tag!!!'))
        }
        
        let gameInfoArray = []
        for(let i = 0; i < gameModulesArray.length; i++){
            let gameInfo = []
            for(let j = 0; j < gameModulesArray[i].length; j++){
                if(gameModulesArray[i][j].indexOf('>') != gameModulesArray[i][j].length -1 || gameModulesArray[i][j].indexOf('>') != -1){
                    let dataText = gameModulesArray[i][j].slice(gameModulesArray[i][j].indexOf('>') + 1)
                    if(dataText != '' && dataText != '(' && dataText != ')') gameInfo.push(dataText)
                }    
            }
            gameInfoArray.push(gameInfo)
        }
        
        for(let i = 0; i < gameDay.sameDayGames.length; i++){
            let sportsbookGameData = gameDay.sameDayGames[i]
            let actualGameData;
            for(let j = 0; j < gameInfoArray.length; j++){
                let espnGameData = gameInfoArray[j]
                if(espnGameData[6] == 'Trail Blazers') espnGameData[6] = 'Blazers'
                if(espnGameData[7] == 'Trail Blazers') espnGameData[7] = 'Blazers'
                
                if(gameInfoArray[j].length != 24){
                    //OT Game
                    if(sportsbookGameData.general.away.substring(sportsbookGameData.general.away.lastIndexOf(' ') + 1) == espnGameData[7]) {
                        actualGameData = espnGameData
                    }
                    continue
                }
                //Non-OT Game
                
                if(sportsbookGameData.general.away.substring(sportsbookGameData.general.away.lastIndexOf(' ') + 1) == espnGameData[6]) {
                    actualGameData = espnGameData
                }
            }
            // Put actualGameData into gameDay.sameDayGames[i] object (remember OT is a special case)
            if(actualGameData[0].includes('/OT')){
                //Handle OT Games
                gameDay.sameDayGames[i].actual.awayFirstQuarter = parseInt(actualGameData[11])
                gameDay.sameDayGames[i].actual.awaySecondQuarter = parseInt(actualGameData[12])
                gameDay.sameDayGames[i].actual.awayHalftime = gameDay.sameDayGames[i].actual.awayFirstQuarter + gameDay.sameDayGames[i].actual.awaySecondQuarter
                gameDay.sameDayGames[i].actual.awayThirdQuarter = parseInt(actualGameData[13])
                gameDay.sameDayGames[i].actual.awayThirdQuarterCumulative = gameDay.sameDayGames[i].actual.awayHalftime +  gameDay.sameDayGames[i].actual.awayThirdQuarter
                gameDay.sameDayGames[i].actual.awayFourthQuarter = parseInt(actualGameData[14])
                gameDay.sameDayGames[i].actual.awayRegulation = gameDay.sameDayGames[i].actual.awayThirdQuarterCumulative + gameDay.sameDayGames[i].actual.awayFourthQuarter
                gameDay.sameDayGames[i].actual.awayOvertime = parseInt(actualGameData[15])
                gameDay.sameDayGames[i].actual.awayFinalScore = parseInt(actualGameData[16])
                gameDay.sameDayGames[i].actual.homeFirstQuarter = parseInt(actualGameData[21])
                gameDay.sameDayGames[i].actual.homeSecondQuarter = parseInt(actualGameData[22])
                gameDay.sameDayGames[i].actual.homeHalftime = gameDay.sameDayGames[i].actual.homeFirstQuarter + gameDay.sameDayGames[i].actual.homeSecondQuarter
                gameDay.sameDayGames[i].actual.homeThirdQuarter = parseInt(actualGameData[23])
                gameDay.sameDayGames[i].actual.homeThirdQuarterCumulative = gameDay.sameDayGames[i].actual.homeHalftime +  gameDay.sameDayGames[i].actual.homeThirdQuarter
                gameDay.sameDayGames[i].actual.homeFourthQuarter = parseInt(actualGameData[24])
                gameDay.sameDayGames[i].actual.hoomeRegulation = gameDay.sameDayGames[i].actual.homeThirdQuarterCumulative + gameDay.sameDayGames[i].actual.homeFourthQuarter
                gameDay.sameDayGames[i].actual.homeOvertime = parseInt(actualGameData[25])
                gameDay.sameDayGames[i].actual.homeFinalScore = parseInt(actualGameData[26])
            } else {
                //Non-OT Games
                gameDay.sameDayGames[i].actual.awayFirstQuarter = parseInt(actualGameData[10])
                gameDay.sameDayGames[i].actual.awaySecondQuarter = parseInt(actualGameData[11])
                gameDay.sameDayGames[i].actual.awayHalftime = gameDay.sameDayGames[i].actual.awayFirstQuarter + gameDay.sameDayGames[i].actual.awaySecondQuarter
                gameDay.sameDayGames[i].actual.awayThirdQuarter = parseInt(actualGameData[12])
                gameDay.sameDayGames[i].actual.awayThirdQuarterCumulative = gameDay.sameDayGames[i].actual.awayHalftime +  gameDay.sameDayGames[i].actual.awayThirdQuarter
                gameDay.sameDayGames[i].actual.awayFourthQuarter = parseInt(actualGameData[13])
                gameDay.sameDayGames[i].actual.awayFinalScore = parseInt(actualGameData[14])
                gameDay.sameDayGames[i].actual.homeFirstQuarter = parseInt(actualGameData[19])
                gameDay.sameDayGames[i].actual.homeSecondQuarter = parseInt(actualGameData[20])
                gameDay.sameDayGames[i].actual.homeHalftime = gameDay.sameDayGames[i].actual.homeFirstQuarter + gameDay.sameDayGames[i].actual.homeSecondQuarter
                gameDay.sameDayGames[i].actual.homeThirdQuarter = parseInt(actualGameData[21])
                gameDay.sameDayGames[i].actual.homeThirdQuarterCumulative = gameDay.sameDayGames[i].actual.homeHalftime +  gameDay.sameDayGames[i].actual.homeThirdQuarter
                gameDay.sameDayGames[i].actual.homeFourthQuarter = parseInt(actualGameData[22])
                gameDay.sameDayGames[i].actual.homeFinalScore = parseInt(actualGameData[23])

            }
            gameDay.sameDayGames[i].actual.spread = Math.abs(gameDay.sameDayGames[i].actual.homeFinalScore - gameDay.sameDayGames[i].actual.awayFinalScore)        
            let awayRecord;
            if(actualGameData.indexOf('Trail Blazers') > 0 && actualGameData.indexOf('Trail Blazers') < 10) awayRecord = actualGameData[actualGameData.indexOf('Trail Blazers') + 1] 
            awayRecord = actualGameData[actualGameData.indexOf(gameDay.sameDayGames[i].general.away.substring(gameDay.sameDayGames[i].general.away.lastIndexOf(' ') + 1)) + 1] 
            let homeRecord;
            if(actualGameData.indexOf('Trail Blazers') > 10) homeRecord = actualGameData[actualGameData.indexOf('Trail Blazers') + 1]
            homeRecord = actualGameData[actualGameData.indexOf(gameDay.sameDayGames[i].general.home.substring(gameDay.sameDayGames[i].general.home.lastIndexOf(' ') + 1)) + 1]
            //If awayFinalScore > homeFinalScore subtract one from awayWins and one from homeLosses. Vice-versa if not.
            let awayWins, awayLosses, homeWins, homeLosses;
            gameDay.sameDayGames[i].actual.awayFinalScore > gameDay.sameDayGames[i].actual.homeFinalScore ?  
                (awayWins = parseInt(awayRecord.substring(0, awayRecord.indexOf('-'))) -1, 
                awayLosses = parseInt(awayRecord.substring(awayRecord.indexOf('-') + 1)),
                homeWins = parseInt(homeRecord.substring(0, homeRecord.indexOf('-'))),
                homeLosses = parseInt(homeRecord.substring(homeRecord.indexOf('-') + 1)) - 1 
                )
                :
                (awayWins = parseInt(awayRecord.substring(0, awayRecord.indexOf('-'))), 
                awayLosses = parseInt(awayRecord.substring(awayRecord.indexOf('-') + 1)) - 1,
                homeWins = parseInt(homeRecord.substring(0, homeRecord.indexOf('-'))) - 1,
                homeLosses = parseInt(homeRecord.substring(homeRecord.indexOf('-') + 1))
                ) 
            gameDay.sameDayGames[i].general.gameNumberAway = awayWins + awayLosses + 1
            gameDay.sameDayGames[i].general.gameNumberHome = homeWins + homeLosses + 1
            gameDay.sameDayGames[i].general.awayRecordFull = `${awayWins}-${awayLosses}`
            gameDay.sameDayGames[i].general.awayRecordFullPct = gameDay.sameDayGames[i].general.gameNumberAway > 1 ? `${awayWins/(awayWins + awayLosses)}%` : '0.00%'
            gameDay.sameDayGames[i].general.homeRecordFull = `${homeWins}-${homeLosses}`
            gameDay.sameDayGames[i].general.homeRecordFullPct = gameDay.sameDayGames[i].general.gameNumberHome > 1 ? `${homeWins/(homeWins + homeLosses)}%` : '0.00%'
            // Include Context Info:
            let awayContextRecord;
            if(actualGameData.indexOf('Trail Blazers') > 0 && actualGameData.indexOf('Trail Blazers') < 10) awayContextRecord = actualGameData[actualGameData.indexOf('Trail Blazers') + 2] 
            awayContextRecord = actualGameData[actualGameData.indexOf(gameDay.sameDayGames[i].general.away.substring(gameDay.sameDayGames[i].general.away.lastIndexOf(' ') + 1)) + 2] 
            let homeContextRecord;
            if(actualGameData.indexOf('Trail Blazers') > 10) homeContextRecord = actualGameData[actualGameData.indexOf('Trail Blazers') + 2]
            homeContextRecord = actualGameData[actualGameData.indexOf(gameDay.sameDayGames[i].general.home.substring(gameDay.sameDayGames[i].general.home.lastIndexOf(' ') + 1)) + 2]
            let awayContextWins, awayContextLosses, homeContextWins, homeContextLosses;
            gameDay.sameDayGames[i].actual.awayFinalScore > gameDay.sameDayGames[i].actual.homeFinalScore ?  
                (awayContextWins = parseInt(awayRecord.substring(0, awayRecord.indexOf('-'))) -1, 
                awayContextLosses = parseInt(awayRecord.substring(awayRecord.indexOf('-') + 1)),
                homeContextWins = parseInt(homeRecord.substring(0, homeRecord.indexOf('-'))),
                homeContextLosses = parseInt(homeRecord.substring(homeRecord.indexOf('-') + 1)) - 1 
                )
                :
                (awayContextWins = parseInt(awayRecord.substring(0, awayRecord.indexOf('-'))), 
                awayContextLosses = parseInt(awayRecord.substring(awayRecord.indexOf('-') + 1)) - 1,
                homeContextWins = parseInt(homeRecord.substring(0, homeRecord.indexOf('-'))) - 1,
                homeContextLosses = parseInt(homeRecord.substring(homeRecord.indexOf('-') + 1))
                ) 
            gameDay.sameDayGames[i].general.gameNumberAwayContext = awayContextWins + awayContextLosses + 1
            gameDay.sameDayGames[i].general.gameNumberHomeContext = homeContextWins + homeContextLosses + 1
            gameDay.sameDayGames[i].general.awayContextRecordFull = `${awayContextWins}-${awayContextLosses}`
            gameDay.sameDayGames[i].general.awayContextRecordFullPct = gameDay.sameDayGames[i].general.gameNumberAwayContext > 1 ? `${awayContextWins/(awayContextWins + awayContextLosses)}%` : '0.00%'
            gameDay.sameDayGames[i].general.homeContextRecordFull = `${homeContextWins}-${homeContextLosses}`
            gameDay.sameDayGames[i].general.homeContextRecordFullPct = gameDay.sameDayGames[i].general.gameNumberHomeContext > 1 ? `${homeContextWins/(homeContextWins + homeContextLosses)}%` : '0.00%'
        
            gameDay.sameDayGames[i].actual.total = gameDay.sameDayGames[i].actual.awayFinalScore + gameDay.sameDayGames[i].actual.homeFinalScore

            // Fill out results object

            if(gameDay.sameDayGames[i].prediction.fav == 'H'){
                if(gameDay.sameDayGames[i].actual.homeFinalScore > gameDay.sameDayGames[i].actual.awayFinalScore) {
                    gameDay.sameDayGames[i].results.moneyline = {
                        'winner': 'H',
                        'result': 'Fav',
                        'payout': gameDay.sameDayGames[i].prediction.homeML
                    }
                }
                else {
                    gameDay.sameDayGames[i].results.moneyline = {
                        'winner': 'A',
                        'result': 'Dog',
                        'payout': gameDay.sameDayGames[i].prediction.awayML
                    }
                }
            } else {
                if(gameDay.sameDayGames[i].actual.homeFinalScore > gameDay.sameDayGames[i].actual.awayFinalScore){
                    gameDay.sameDayGames[i].results.moneyline = {
                        'winner': 'H',
                        'result': 'Dog',
                        'payout': gameDay.sameDayGames[i].prediction.homeML
                    }
                } 
                else {
                    gameDay.sameDayGames[i].results.moneyline = {
                        'winner': 'A',
                        'result': 'Fav',
                        'payout': gameDay.sameDayGames[i].prediction.homeML
                    }
                }
            }
            if(gameDay.sameDayGames[i].prediction.total > gameDay.sameDayGames[i].actual.total) {
                gameDay.sameDayGames[i].results.total = {
                    'result': 'Under',
                    'payout': gameDay.sameDayGames[i].prediction.underPays
                }
            } else {
                gameDay.sameDayGames[i].results.total = {
                    'result': 'Over',
                    'payout': gameDay.sameDayGames[i].prediction.overPays
                }
            }
            gameDay.sameDayGames[i].results.total.resultDifference = gameDay.sameDayGames[i].actual.total - gameDay.sameDayGames[i].prediction.total
            if(gameDay.sameDayGames[i].results.moneyLineResult == 'Dog'){
                gameDay.sameDayGames[i].results.spread = {
                    'winner': 'Dog', 
                    'type': 'Upset',
                    'payout': gameDay.sameDayGames[i].prediction.dogSpreadPays
                    }
            } else {
                if(gameDay.sameDayGames[i].actual.spread > gameDay.sameDayGames[i].prediction.spread) {
                    gameDay.sameDayGames[i].results.spread = {
                        'winner': 'Fav', 
                        'type': 'Cover',
                        'payout': gameDay.sameDayGames[i].prediction.favSpreadPays
                        }
                } else {
                    gameDay.sameDayGames[i].results.spread = {
                        'winner': 'Dog', 
                        'type': 'ATS',
                        'payout': gameDay.sameDayGames[i].prediction.dogSpreadPays
                        }
                }
            } 
            //Update gameTracker object. Check first to see if entry exists in gameTracker Object
            
            if(!teamTracker[gameDay.sameDayGames[i].general.away]){
                teamTracker[gameDay.sameDayGames[i].general.away] = {}
                teamTracker[gameDay.sameDayGames[i].general.away].games = []

            } 
            if(!teamTracker[gameDay.sameDayGames[i].general.home]) {
                teamTracker[gameDay.sameDayGames[i].general.home] = {}
                teamTracker[gameDay.sameDayGames[i].general.home].games = []
            }
            
            let thisGameAway = {}
            let thisGameHome = {}

            thisGameAway.date = currentDate
            thisGameHome.date = currentDate
            thisGameAway.context = 'A'
            thisGameHome.context = 'H'
            gameDay.sameDayGames[i].actual.awayFinalScore > gameDay.sameDayGames[i].actual.homeFinalScore ?
                (thisGameAway.outcome = 'W', thisGameHome.outcome = 'L') : (thisGameAway.outcome = 'L', thisGameHome.outcome = 'W')
            
            thisGameAway.pointDifferential= gameDay.sameDayGames[i].actual.awayFinalScore - gameDay.sameDayGames[i].actual.homeFinalScore
            
            thisGameHome.pointDifferential = gameDay.sameDayGames[i].actual.homeFinalScore - gameDay.sameDayGames[i].actual.awayFinalScore

            teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0 ?
                thisGameAway.pointDifferentialRunning = 
                teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].pointDifferentialRunning + thisGameAway.pointDifferential
                : thisGameAway.pointDifferentialRunning = thisGameAway.pointDifferential
        
            teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0 ?
            thisGameHome.pointDifferentialRunning = 
            teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].pointDifferentialRunning + thisGameHome.pointDifferential
            : thisGameHome.pointDifferentialRunning = thisGameHome.pointDifferential

            teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0 ?
                [thisGameAway.roadTripIncluding, thisGameAway.homestandIncluding] = 
                [teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].roadTripIncluding + 1, 0] : [1, 0]
        
            teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0 ?
            [thisGameHome.homestandIncluding, thisGameHome.roadTripIncluding] = 
            [teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].homestandIncluding + 1, 0] : [1, 0]
            
            thisGameAway.streaks = {}
            thisGameHome.streaks = {}

            if(teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0){
                
                if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].outcome == 'W'){
                    teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.general > -1 ?
                    thisGameAway.streaks.general += 1 : thisGameAway.streaks.general = 1
                    if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].context == 'A'){
                        thisGameAway.streaks.home = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home
                        teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away > -1 ?
                        thisGameAway.streaks.away += 1 : thisGameAway.streaks.away = 1
                    } else {
                        thisGameAway.streaks.away = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away
                        teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home > -1 ?
                        thisGameAway.streaks.home += 1 : thisGameAway.streaks.home = 1
                    }

                } else {
                    teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.general < -1 ?
                    thisGameAway.streaks.general -= 1 : thisGameAway.streaks.general = -1
                
                    if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].context == 'A'){
                        thisGameAway.streaks.home = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home
                        teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away < -1 ?
                        thisGameAway.streaks.away -= 1 : thisGameAway.streaks.away = -1
                    } else {
                        thisGameAway.streaks.away = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away
                        teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home < -1 ?
                        thisGameAway.streaks.home -= 1 : thisGameAway.streaks.home = -1
                    }

                }  
            } else {
                thisGameAway.streaks = {
                    'general': 0,
                    'away': 0,
                    'home': 0
                }
            }

            if(teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0){
                if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].outcome == 'W'){
                    teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.general > -1 ?
                    thisGameHome.streaks.general += 1 : thisGameHome.streaks.general = 1
                    if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].context == 'A'){
                        thisGameHome.streaks.home = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home
                        teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away > -1 ?
                        thisGameHome.streaks.away += 1 : thisGameHome.streaks.away = 1
                    } else {
                        thisGameHome.streaks.away = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away
                        teamTracker[gameDay.sameDayGames[i].general.Home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home > -1 ?
                        thisGameHome.streaks.home += 1 : thisGameHome.streaks.home = 1
                    }

                } else {
                    teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome- 2].streaks.general < -1 ?
                    thisGameHome.streaks.general -= 1 : thisGameHome.streaks.general = -1
                
                    if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].context == 'A'){
                        thisGameHome.streaks.home = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home
                        teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away < -1 ?
                        thisGameHome.streaks.away -= 1 : thisGameHome.streaks.away = -1
                    } else {
                        thisGameHome.streaks.away = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away
                        teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home < -1 ?
                        thisGameHome.streaks.home -= 1 : thisGameHome.streaks.home = -1
                    }
                } 
            } else {
                thisGameHome.streaks = {
                    'general': 0,
                    'away': 0,
                    'home': 0
                }
            }
            
            teamTracker[gameDay.sameDayGames[i].general.away].games.push(thisGameAway)
            teamTracker[gameDay.sameDayGames[i].general.home].games.push(thisGameHome)
            
            
            
        }

        //For Loop for day ends, write temp objs to file

        allGamedays.push(gameDay)
        
        let allGamedaysFile = `./json/Gamedays/${allGamedays.length}_${espnDate}.json`

        fileSystem.outputFile(allGamedaysFile, JSON.stringify(allGamedays, null, 2), (error) => {
            if(error) console.log(error)
        })

        let teamTrackerFile = `./json/TeamTrackers/${allGamedays.length}_${espnDate}.json`
        fileSystem.outputFile(teamTrackerFile, JSON.stringify(teamTracker, null, 2), (error) => {
            if(error) console.log(error)
        })
        currentDate = currentDate.setDate(currentDate.getDate() + 1)
    }
    // For Loop for season ends, write objs to file
    // fileSystem.outputFile('allGamedays.json', JSON.stringify(allGamedays, null, 2), (error) => {
    //     if(error) throw error;
    // })
    // fileSystem.outputFile('teamTracker.json', JSON.stringify(allGamedays, null, 2), (error) => {
    //     if(error) throw error;
    // })
    // console.log(JSON.stringify(allGamedays, null, 2))

};

// getLines();
collectData();