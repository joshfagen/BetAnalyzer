import * as fileSystem from 'fs-extra';
export default async function writeFiles(allGamedays, teamTracker, currentDate) {
    let currentYear = currentDate.getFullYear()
    let currentMonth = currentDate.getMonth() + 1
    let currentDay = currentDate.getDate()
    
    let espnDate = `${currentYear}${currentMonth}${currentDay}`
        let allGamedaysFile = `./json/Gamedays/Gamedays.json`

        fileSystem.outputFile(allGamedaysFile, JSON.stringify(allGamedays, null, 2), (error) => {
            if(error) console.log(error)
        })

        let teamTrackerFile =  `./json/TeamTrackers/TeamTracker.json`
        fileSystem.outputFile(teamTrackerFile, JSON.stringify(teamTracker, null, 2), (error) => {
            if(error) console.log(error)
        })
}