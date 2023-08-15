
import fs, * as FileSystem from "fs-extra";

let file = './json/Gamedays/Gamedays.json'

fs.readJson(file, (err, obj) => {
    if (err) return console.log(err);
    let overallSpreadResultsArr = []
    
    for(let i = 0; i < obj.length; i++){
        for(let j = 0; j < obj[i].sameDayGames.length; j++){
            let game = obj[i].sameDayGames[j]
            let predictedSpread = game.prediction.spread
            let index = 0
            let foundIndex = overallSpreadResultsArr.findIndex(x => x.predictedSpread == predictedSpread)
            if (foundIndex == -1) {
                overallSpreadResultsArr.push(
                    {
                        "predictedSpread": predictedSpread,
                        "count": 1,
                        "covers": 0,
                        "losses": 0
                    }
                )
                index = overallSpreadResultsArr.length - 1
            }
            else{
                index = overallSpreadResultsArr.findIndex(x => x.predictedSpread == predictedSpread)
                overallSpreadResultsArr[index].count++
            }
    
            if(game.results.spread.winner == 'Fav') overallSpreadResultsArr[(index)].covers++
            else overallSpreadResultsArr[index].losses++
        }
    }
    overallSpreadResultsArr.sort((a, b) => {
        return a.predictedSpread - b.predictedSpread
    })
    
    for(let i = 0; i < overallSpreadResultsArr.length; i++){
        overallSpreadResultsArr[i].percentage = overallSpreadResultsArr[i].covers / overallSpreadResultsArr[i].count             
    }
    
    let spreadResults = './json/DeeperAnalysis/spread_results.json'
        
    FileSystem.outputFile(spreadResults, JSON.stringify(overallSpreadResultsArr, null, 2), (error) => {
        if(error) console.log(error)
    })
})