import collectData from "./CollectData.js";
import analyzeData from "./AnalyzeData.js";
import updateTeamTracker from "./CollectDataFunctions/updateTeamTracker.js";
import fs, * as FileSystem from "fs-extra";

updateTeamTracker();
// analyzeData();
// analyzeData(bankroll, unitSize, wagerType, conditions)

// collectData();

// let file = './json/Gamedays/Gamedays.json'

// fs.readJson(file, (err, obj) => {
//     if (err) return console.log(err);
//     let overallTotalResultsArr = []
    
//     for(let i = 0; i < obj.length; i++){
//         for(let j = 0; j < obj[i].sameDayGames.length; j++){
//             let game = obj[i].sameDayGames[j]
//             let predictedTotal = game.prediction.total
//             let index = 0
//             let foundIndex = overallTotalResultsArr.findIndex(x => x.predictedTotal == predictedTotal)
//             if (foundIndex == -1) {
//                 overallTotalResultsArr.push(
//                     {
//                         "predictedTotal": predictedTotal,
//                         "count": 1,
//                         "overs": 0,
//                         "unders": 0
//                     }
//                 )
//                 index = overallTotalResultsArr.length - 1
//             }
//             else{
//                 index = overallTotalResultsArr.findIndex(x => x.predictedTotal == predictedTotal)
//                 overallTotalResultsArr[index].count++
//             }
    
//             if(game.results.total.result == 'Over') overallTotalResultsArr[(index)].overs++
//             else overallTotalResultsArr[index].unders++
//         }
//     }
//     overallTotalResultsArr.sort((a, b) => {
//         return a.predictedTotal - b.predictedTotal
//     })
    
//     for(let i = 0; i < overallTotalResultsArr.length; i++){
//         overallTotalResultsArr[i].percentage = overallTotalResultsArr[i].overs / overallTotalResultsArr[i].count             
//     }
    
//     let totalResults = './json/DeeperAnalysis/total_results.json'
        
//     FileSystem.outputFile(totalResults, JSON.stringify(overallTotalResultsArr, null, 2), (error) => {
//         if(error) console.log(error)
//     })
// })