export default async function buildGameDayPredictions(gamesObjectArray, currentDate) {
    
    //build data object for each game, push to sameDayGames array
    let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    let gameDay = {}
    gameDay.general = {}
    gameDay.general.date = gamesObjectArray[0][0]
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
        if(gameData.prediction.spread = parseFloat(currentGame[3].slice(1, currentGame[3].indexOf(' '))) == 'PK'){
            gameData.prediction.spread = 0
        }
        else {
            gameData.prediction.spread = parseFloat(currentGame[3].slice(1, currentGame[3].indexOf(' ')))
        }
        
        gameData.prediction.awaySpreadPays = parseInt(currentGame[3].slice(currentGame[3].indexOf(' ') + 1))
        gameData.prediction.homeSpreadPays = parseInt(currentGame[8].slice(currentGame[8].indexOf(' ') + 1))
        gameData.prediction.fav == 'H' ? 
            (gameData.prediction.favSpreadPays = gameData.prediction.homeSpreadPays, gameData.prediction.dogSpreadPays = gameData.prediction.awaySpreadPays) : 
            (gameData.prediction.dogSpreadPays = gameData.prediction.awaySpreadPays, gameData.prediction.favSpreadPays = gameData.prediction.homeSpreadPays)
        gameData.prediction.total = parseFloat(currentGame[4].slice(1, currentGame[4].indexOf(' ')))
        gameData.prediction.overPays = parseInt(currentGame[4].slice(currentGame[4].indexOf(' ') + 1))
        gameData.prediction.underPays = parseInt(currentGame[9].slice(currentGame[9].indexOf(' ') + 1))
        gameData.prediction.favScoreprediction = Math.round(gameData.prediction.total / 2 + gameData.prediction.spread / 2)
        gameData.prediction.dogScoreprediction = Math.round(gameData.prediction.total / 2 - gameData.prediction.spread / 2)
        gameData.prediction.predictionScore = `${gameData.prediction.favScoreprediction} - ${gameData.prediction.dogScoreprediction}`

        gameDay.sameDayGames.push(gameData)
    }

    return gameDay
}
