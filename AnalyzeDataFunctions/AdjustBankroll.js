export default function adjustBankroll(result, i, gamedaysCopy){
    let amountNeeded = 0
    let amountInjectedDaily = 0
    let difference = 0
    let textFile = result.textFile

    if(wagerType == 'risking') amountNeeded = result.unit * gamedaysCopy[i].sameDayGames.length 
    if(result.profits > 0){
        if(amountNeeded > (result.bankroll + result.profits)){
            amountInjectedDaily = amountNeeded - (result.bankroll + result.profits)
            result.amountInjectedTotal += amountInjectedDaily
            result.bankroll += amountInjectedDaily
        } 
        else{
            if(amountNeeded > result.bankroll) {
                difference = amountNeeded - bankroll
                result.profits = result.profits - difference                    
                result.bankroll += difference
            } 
        }
    } else {
        amountInjectedDaily = amountNeeded - result.bankroll
        result.bankroll += amountInjectedDaily
        result.amountInjectedTotal += amountInjectedDaily
    }

    textFile += `--------------------------------------------------------------------------------------------------------`
            textFile += '\n'
            textFile += `${gamedaysCopy[i].general.dayOfWeekName}: ${gamedaysCopy[i].general.date}. ${gamedaysCopy[i].sameDayGames.length} Game(s)`
            textFile += '\n'

            
    result.textFile = adjustBankrollMessage(result, amountNeeded, amountInjectedDaily, difference)
}

function adjustBankrollMessage(result, amountNeeded, amountInjectedDaily, difference) {
    let profits = result.profits
    let textFile = result.textFile
    let bankroll = result.bankroll
    
    if(amountInjectedDaily > 0){
        if(profits > 0) {
             textFile += `You need $${amountNeeded.toFixed(2)}. 
            You currently have $${(bankroll - amountInjectedDaily).toFixed(2)} in your bankroll
            and $${profits.toFixed(2)} in your profits, making a total of $${(bankroll - amountInjectedDaily + profits).toFixed(2)}
            $${profits.toFixed(2)} has been transferred from your profits to your bankroll,
            and $${amountInjectedDaily.toFixed(2)} has been injected into the bankroll, bringing it to $${(bankroll + profits).toFixed(2)}.`

        } else {
            textFile += `You need $${amountNeeded.toFixed(2)}. 
            You currently have $${(bankroll - amountInjectedDaily).toFixed(2)} in your bankroll, 
            and $${profits.toFixed(2)} in total returns.
            $${amountInjectedDaily.toFixed(2)} has been injected into the bankroll, bringing it to $${bankroll.toFixed(2)}.`
        }
       
    }  else {
        textFile += `You need $${amountNeeded.toFixed(2)}. 
                    You currently have $${(bankroll - difference).toFixed(2)} in your bankroll, and $${(profits + difference).toFixed(2)} in your profits.
                    This adds up to $${(bankroll + profits + difference).toFixed(2)}
                    $${difference.toFixed(2)} has been transferred from your profits to your bankroll, bringing it to $${(bankroll + difference).toFixed(2)}`
    }
    return textFile
}