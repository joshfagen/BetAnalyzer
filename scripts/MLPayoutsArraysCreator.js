import collectData from "./CollectData.js";
import analyzeData from "./AnalyzeData.js";
import fs, * as FileSystem from "fs-extra";

// analyzeData();
// analyzeData(bankroll, unitSize, wagerType, conditions)
// collectData();
let file = './json/Gamedays/Gamedays.json'

fs.readJson(file, (err, obj) => {
    if (err) return console.log(err);
    let overallMLPayoutsArr = []
    for(let i = 0; i < obj.length; i++){
        for(let j = 0; j < obj[i].sameDayGames.length; j++){
            let game = obj[i].sameDayGames[j]
            let amount = game.prediction.homeML
            let index = 0
            let foundIndex = overallMLPayoutsArr.findIndex(x => x.amount == amount)
            if (foundIndex == -1) {
                overallMLPayoutsArr.push(
                    {
                        "amount": amount,
                        "count": 1,
                        "wins": 0,
                        "losses": 0
                    }
                )
                index = overallMLPayoutsArr.length - 1
            }
            else{
                index = overallMLPayoutsArr.findIndex(x => x.amount == amount)
                overallMLPayoutsArr[index].count++
            }
            amount = game.prediction.awayML
            foundIndex = overallMLPayoutsArr.findIndex(x => x.amount == amount)
            if (foundIndex == -1) {
            
                overallMLPayoutsArr.push(
                    
                    {
                        "amount": amount,
                        count: 1,
                        "count": 1,
                        "wins": 0,
                        "losses": 0
                    }
                )
                index = overallMLPayoutsArr.length - 1
            }
            else{
                index = overallMLPayoutsArr.findIndex(x => x.amount == amount)
                overallMLPayoutsArr[index].count++
            }
            if(game.results.moneyline.winner == 'H'){
                overallMLPayoutsArr[overallMLPayoutsArr.findIndex(x => x.amount == game.prediction.homeML)].wins++
                overallMLPayoutsArr[overallMLPayoutsArr.findIndex(x => x.amount == game.prediction.awayML)].losses++

            } else {
                overallMLPayoutsArr[overallMLPayoutsArr.findIndex(x => x.amount == game.prediction.awayML)].wins++
                overallMLPayoutsArr[overallMLPayoutsArr.findIndex(x => x.amount == game.prediction.homeML)].losses++
            }
            
            

        }
    }
    overallMLPayoutsArr.sort((a, b) => {
        return a.amount - b.amount
    })
    let favMLPayouts = []
    let dogMLPayouts = []
    for(let i = 0; i < overallMLPayoutsArr.length; i++){
        overallMLPayoutsArr[i].percentage = overallMLPayoutsArr[i].wins / overallMLPayoutsArr[i].count
        
        if(overallMLPayoutsArr[i].amount < 0){
            overallMLPayoutsArr[i].breakEvenPct = 1 - (1/((overallMLPayoutsArr[i].amount*-1)/100 +1))
            favMLPayouts.push(overallMLPayoutsArr[i])

        } else {
            overallMLPayoutsArr[i].breakEvenPct = (1/(overallMLPayoutsArr[i].amount/100 +1))
            dogMLPayouts.push(overallMLPayoutsArr[i])
        }
             
    }
    let textFileFullDogML = `./json/text_file_dogMLPayouts.json`
    let textFileFullFavML = `./json/text_file_favMLPayouts.json`
        
    FileSystem.outputFile(textFileFullDogML, JSON.stringify(dogMLPayouts, null, 2), (error) => {
        if(error) console.log(error)
    })
    FileSystem.outputFile(textFileFullFavML, JSON.stringify(favMLPayouts, null, 2), (error) => {
        if(error) console.log(error)
    })
    
    
    
})