import fs, * as FileSystem from 'fs-extra';
export default async function analyzeData(){
    let unit = 100
    let wagerType = 'risking'
    let bankroll = 0
    let profits = 0
    let wins = 0
    let winCount = 0
    let amountInjectedTotal = 0
    let losses = 0
    let lossCount = 0
    let difference = 0

    fs.readJSON('./json/Gamedays/Gamedays.json', (err, object) => {
        if (err) return console.log(err)
        let gamedaysCopy = object
        let textFile = ''
        
        for(let i = 0; i < gamedaysCopy.length; i++){
            let amountNeeded = 0
            let amountInjectedDaily = 0
            if(wagerType == 'risking') amountNeeded = unit * gamedaysCopy[i].sameDayGames.length 
            if(profits > 0){
                if(amountNeeded > (bankroll + profits)){
                    amountInjectedDaily = amountNeeded - (bankroll + profits)
                    amountInjectedTotal += amountInjectedDaily
                    bankroll += amountInjectedDaily
                } 
                else{
                    if(amountNeeded > bankroll) {
                        difference = amountNeeded - bankroll
                        profits = profits - difference                    
                        bankroll += difference
                    } 
                }
            } else {
                amountInjectedDaily = amountNeeded - bankroll
                bankroll += amountInjectedDaily
                amountInjectedTotal += amountInjectedDaily

            }
            

            textFile += `--------------------------------------------------------------------------------------------------------`
            textFile += '\n'
            textFile += `${gamedaysCopy[i].general.dayOfWeekName}: ${gamedaysCopy[i].general.date}. ${gamedaysCopy[i].sameDayGames.length} Game(s)`
            textFile += '\n'

            if(amountInjectedDaily > 0){
                textFile += `You need $${amountNeeded.toFixed(2)}. 
                            You currently have $${bankroll.toFixed(2)} in your bankroll, and $${profits.toFixed(2)} in your profits.
                            $${profits.toFixed(2)} has been transferred from your profits to your bankroll,
                            and $${amountInjectedDaily.toFixed(2)} has been injected into the bankroll`
            }  else {
                textFile += `You need $${amountNeeded.toFixed(2)}. 
                            You currently have $${bankroll.toFixed(2)} in your bankroll, and $${profits.toFixed(2)} in your profits.
                            $${difference.toFixed(2)} has been transferred from your profits to your bankroll`
            }
                let dailyWins = 0

                let dailyWinCount = 0
                let dailyLosses = 0
                let dailyLossCount = 0
            
            for(let j = 0; j < gamedaysCopy[i].sameDayGames.length; j++){
                let game = gamedaysCopy[i].sameDayGames[j]
                textFile += '\n'
                textFile += `###########`
                textFile += '\n'
                if(game.results.moneyline.result == 'Fav'){
                    textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                    textFile += '\n'
                    textFile += `Result: Win!!! Payout: $${(unit / (game.results.moneyline.payout * -1) * 100).toFixed(2)}`
                    dailyWins += unit / (game.results.moneyline.payout * -1) * 100
                    dailyWinCount++
                } else {
                    textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                    textFile += '\n'
                    textFile += `Result: Loss :(:(:( Loss: $${unit}`
                    dailyLosses += unit
                    bankroll -= unit
                    dailyLossCount++
                }
            }
            textFile += '\n'
            textFile +='%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
            wins += dailyWins
            winCount += dailyWinCount
            losses += dailyLosses
            lossCount += dailyLossCount
            profits = wins-losses
            textFile += '\n'
            textFile += `Daily Wins: ${dailyWinCount} game(s) out of ${gamedaysCopy[i].sameDayGames.length}. 
                         Daily %: ${(dailyWinCount/gamedaysCopy[i].sameDayGames.length*100).toFixed(3)}%. 
                         Running %: ${(winCount/(winCount+lossCount)*100).toFixed(3)}%.
                         Daily Money Won: $${dailyWins.toFixed(2)}, Total Money Won: $${wins.toFixed(2)}`
            textFile += '\n'
            textFile += `###########`
            textFile += '\n'
            textFile += `Daily Losses: ${dailyLossCount} game(s) out of ${gamedaysCopy[i].sameDayGames.length}.
                        Daily %: ${(dailyLossCount/gamedaysCopy[i].sameDayGames.length*100).toFixed(3)}%.
                        Running %: ${(lossCount/(winCount+lossCount)*100).toFixed(3)}%.
                        Money Lost: $${dailyLosses.toFixed(2)}, Total Money Lost: $${losses.toFixed(2)}`
            textFile += '\n'
            textFile += `###########`
            textFile += '\n'
            textFile += `Overall Daily Performance: $${(dailyWins - dailyLosses).toFixed(2)}`
            textFile += '\n'
            textFile += `Running Profits/Losses: $${(profits).toFixed(2)} `
            textFile += '\n'
            textFile += `Bankroll before Replenishment: $${bankroll.toFixed(2)}`
            textFile += '\n'
            // Replenish Bankroll??
            if(dailyLosses > 0 && dailyWins > 0){
                if(dailyWins > dailyLosses) {
                    bankroll += dailyLosses
                    dailyWins -= dailyLosses
                    profits += dailyWins
                } else {
                    bankroll += dailyWins
                    dailyLosses -= dailyWins
                    if(profits > dailyLosses) {
                        bankroll += dailyLosses
                        profits -= dailyLosses
                    } else {
                        if(profits > 0) {
                            bankroll += profits
                            profits = 0
                        }
                    }
                }
            }
            textFile += `Bankroll Replenished: $${bankroll.toFixed(2)}`
            textFile += '\n'
            textFile += `Amount Injected Overall: $${amountInjectedTotal.toFixed(2)}`
            textFile += '\n'
            textFile += `--------------------------------------------------------------------------------------------------------`
            
        }
        let textFileFull = `./json/text_file.txt`
        
        FileSystem.outputFile(textFileFull, textFile, (error) => {
            if(error) console.log(error)
        })
      });
    
}
