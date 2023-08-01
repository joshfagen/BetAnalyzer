import puppeteer, { Keyboard } from "puppeteer";
import * as dotenv from "dotenv";
import getSeasonDates from "./CollectDataFunctions/GetSeasonDates.js";
import modifyCurrentDate from "./CollectDataFunctions/ModifyCurrentDate.js";
import redditLogin from "./CollectDataFunctions/RedditLogin.js";
import buildGameDayPredictions from "./CollectDataFunctions/BuildGameDayPredictions.js";
import getGamesObjectArray from "./CollectDataFunctions/GetGamesObjectArray.js";
import buildGameDayResults from "./CollectDataFunctions/BuildGameDayResults.js";
import updateTeamTracker from "./CollectDataFunctions/updateTeamTracker.js";
import writeFiles from "./CollectDataFunctions/WriteFiles.js";
import skipDates from "./CollectDataFunctions/SkipDates.js";
export default async function collectData(){

    // Start Puppeteer Session and get starting and ending dates for a given season. (In the future, this will go in a for loop)
    let currentSeason = '2022-23'
    let [page, seasonStart, seasonEnd] = await getSeasonDates(currentSeason);

    let teamTracker = {}
    let allGamedays = []
    // For Loop Should Start Here

    //  currentDate = add i days to seasonStart until seasonEnd
    let currentDate = seasonStart

    currentDate = new Date(currentDate)
    seasonEnd = new Date(seasonEnd.toDateString())
    while(currentDate != seasonEnd) {
        let [currentDateRightFormat, currentMonth, currentDay, currentYear] = await modifyCurrentDate(currentDate)
        
        // go to Reddit and login

        // await redditLogin(page, allGamedays, currentDateRightFormat, currentMonth, currentDay, currentYear)
        
        // accessViaGoogle(page, currentDateRightFormat, currentMonth, currentDay, currentYear)

        //get Array of games from Reddit
        // let gamesObjectArray = await getGamesObjectArray(page, currentMonth, currentDay)

        //Transfer data to gameDay object
        // let gameDay = await buildGameDayPredictions(gamesObjectArray, currentDate)

        // gameDay = await buildGameDayResults(page, gameDay, currentDate)

        // teamTracker = await updateTeamTracker(gameDay, teamTracker, currentDate)

        // allGamedays.push(gameDay)

        // await writeFiles(allGamedays, teamTracker, currentDate)

        currentDate = currentDate.setDate(currentDate.getDate() + 1)
        currentDate = new Date(currentDate)
        

        //Skip Dates with no games (Nov. 8th, Nov. 24th, Dec. 24th, Feb 17-22 [16th --> 23rd], Apr. 3rd)
        currentDate = await skipDates(currentDate)
        console.log(currentDate)
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