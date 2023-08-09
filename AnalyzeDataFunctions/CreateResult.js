export default function createResult(result, bankroll, unitSize, wagerType, conditions){
    
    result = {
        "unit": unitSize,
        "wagerType": wagerType,
        "conditions": conditions,
        "bankroll": bankroll,
        "profits": 0,
        "wins": 0,
        "winCount": 0,
        "amountInjectedTotal": 0,
        "losses": 0,
        "lossCount": 0,
        "textFile": ''
    }

    return result;
       
    
}