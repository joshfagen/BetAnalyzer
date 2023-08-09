export default function evaluateStrategy(result, gamedaysCopy, i){
    let dailyWins = 0

    let dailyWinCount = 0
    let dailyLosses = 0
    let dailyLossCount = 0
    for(let j = 0; j < gamedaysCopy[i].sameDayGames.length; j++){

        let game = gamedaysCopy[i].sameDayGames[j]
        textFile += '\n'
        textFile += `###########`
        textFile += '\n'
        
        //For Fav ML
        // if(game.results.moneyline.result == 'Fav'){
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Win!!! Payout: $${(unit / (game.results.moneyline.payout * -1) * 100).toFixed(2)}`
        //     dailyWins += unit / (game.results.moneyline.payout * -1) * 100
        //     dailyWinCount++
        // } else {
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Loss :(:(:( Loss: $${unit}`
        //     dailyLosses += unit
        //     bankroll -= unit
        //     dailyLossCount++
        // }
    
        //For Underdog ML
        // if(game.results.moneyline.result == 'Dog'){
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Win!!! Payout: $${((game.results.moneyline.payout/100)*unit).toFixed(2)}`
        //     dailyWins += game.results.moneyline.payout/100*unit
        //     dailyWinCount++
        // } else {
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Loss :(:(:( Loss: $${unit}`
        //     dailyLosses += unit
        //     bankroll -= unit
        //     dailyLossCount++
        // }
    
        //For Fav Spread
        // if(game.results.spread.winner == 'Fav'){
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Win!!! Payout: $${(unit / (game.results.spread.payout * -1) * 100).toFixed(2)}`
        //     dailyWins += unit / (game.results.spread.payout * -1) * 100
        //     dailyWinCount++
        // } else {
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Loss :(:(:( Loss: $${unit}`
        //     dailyLosses += unit
        //     bankroll -= unit
        //     dailyLossCount++
        // }
    
         //For Dog Spread
        // if(game.results.spread.winner == 'Dog'){
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Win!!! Payout: $${(unit / (game.results.spread.payout * -1) * 100).toFixed(2)}`
        //     dailyWins += unit / (game.results.spread.payout * -1) * 100
        //     dailyWinCount++
        // } else {
        //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
        //     textFile += '\n'
        //     textFile += `Result: Loss :(:(:( Loss: $${unit}`
        //     dailyLosses += unit
        //     bankroll -= unit
        //     dailyLossCount++
        // }
    
       //For Over 
                // if(game.results.total.result == 'Over'){
                //     textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                //     textFile += '\n'
                //     textFile += `Result: Win!!! Payout: $${(unit / (game.results.total.payout * -1) * 100).toFixed(2)}`
                //     dailyWins += unit / (game.results.total.payout * -1) * 100
                //     dailyWinCount++
                // } else {
                //     if(game.results.total.result == 'Under'){
                //         textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                //         textFile += '\n'
                //         textFile += `Result: Loss :(:(:( Loss: $${unit}`
                //         dailyLosses += unit
                //         bankroll -= unit
                //         dailyLossCount++
                //     } else {
                //         textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                //         textFile += '\n'
                //         textFile += `Result: Push`
                //     }                    
                // }

                //For Under
                if(game.results.total.result == 'Under'){
                    textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                    textFile += '\n'
                    textFile += `Result: Win!!! Payout: $${(unit / (game.results.total.payout * -1) * 100).toFixed(2)}`
                    dailyWins += unit / (game.results.total.payout * -1) * 100
                    dailyWinCount++
                } else {
                    if(game.results.total.result == 'Over'){
                        textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                        textFile += '\n'
                        textFile += `Result: Loss :(:(:( Loss: $${unit}`
                        dailyLosses += unit
                        bankroll -= unit
                        dailyLossCount++
                    } else {
                        textFile += `Game #${j+1}/${gamedaysCopy[i].sameDayGames.length}: ${game.general.away} @ ${game.general.home}`
                        textFile += '\n'
                        textFile += `Result: Push`
                    }                    
                }
    }
    textFile += '\n'
    textFile +='%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
    
}
