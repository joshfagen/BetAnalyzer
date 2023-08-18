import fs from 'fs-extra';

// export default async function updateTeamTracker(gameDay, teamTracker, currentDate){
async function updateTeamTracker(){
    
    let file = '../json/TeamTrackers/TeamTracker.json'
    
    fs.readJson(file, (err, obj) => {
        let teamTrackerNew = []
        if (err) return console.log(err);
        for(let i = 0; i < Object.keys(obj).length; i++){
            teamTrackerNew.push({
                "team": Object.keys(obj)[i],
                "games": obj[Object.keys(obj)[i]].games
            })
           
            
        }
        fs.readJson('../json/Gamedays/Gamedays.json', (err, obj) => {
            if (err) return console.log(err);
            for(let i = 0; i < obj.length; i++){
                //Game-by-Game logic goes here
                for(let j = 0; j < obj[i].sameDayGames.length; j++){
                    let game = obj[i].sameDayGames[j]
                    let [homeTeam, gameNumberHome, awayTeam, gameNumberAway] = 
                        [game.general.home, game.general.gameNumberHome, game.general.away, game.general.gameNumberAway] 
                    // What's the method to find a key-value pair in an array?
                    let [homeTeamIndex, awayTeamIndex] = 
                        [teamTrackerNew.findIndex(x => x.team == homeTeam), teamTrackerNew.findIndex(x => x.team == awayTeam)]
                    
                    let [dogOrFavHome, dogOrFavAway] = ['', '']
                    game.prediction.fav == 'H' ? [dogOrFavHome = 'fav', dogOrFavAway = 'dog'] : [dogOrFavHome = 'dog', dogOrFavAway = 'fav']
                    
                    if(!Number.isNaN(gameNumberAway - 1)) {
                        teamTrackerNew[homeTeamIndex].games[gameNumberHome - 1] = {
                            "date": game.general.date,
                            "opponent": game.general.away,
                            "context": "H",
                            "favOrDog": dogOrFavHome,
                            "outcome": teamTrackerNew[homeTeamIndex].games[gameNumberHome - 1].outcome,
                            "pointDifferential": teamTrackerNew[homeTeamIndex].games[gameNumberHome - 1].pointDifferential
                        }
                        teamTrackerNew[awayTeamIndex].games[gameNumberAway - 1] = {
                            "date": game.general.date,
                            "opponent": game.general.home,
                            "context": "A",
                            "favOrDog": dogOrFavAway,
                            "outcome": teamTrackerNew[awayTeamIndex].games[gameNumberAway - 1].outcome,
                            "pointDifferential": teamTrackerNew[awayTeamIndex].games[gameNumberAway - 1].pointDifferential
                        }
                    }
                    
                }
            }
            console.log(JSON.stringify(teamTrackerNew[0], null, 2))
        })
        
    });
    
    //Update gameTracker object. Check first to see if entry exists in gameTracker Object
 
    // for(let i = 0; i < gameDay.sameDayGames.length; i++){
    //     try{
            
    //         if(!teamTracker[gameDay.sameDayGames[i].general.away]){
    //             teamTracker[gameDay.sameDayGames[i].general.away] = {}
    //             teamTracker[gameDay.sameDayGames[i].general.away].games = []

    //         } 
    //         if(!teamTracker[gameDay.sameDayGames[i].general.home]) {
    //             teamTracker[gameDay.sameDayGames[i].general.home] = {}
    //             teamTracker[gameDay.sameDayGames[i].general.home].games = []
    //         }

    //         let thisGameAway = {}
    //         let thisGameHome = {}

    //         thisGameAway.date = currentDate
    //         thisGameHome.date = currentDate
    //         thisGameAway.context = 'A'
    //         thisGameHome.context = 'H'
    //         gameDay.sameDayGames[i].actual.awayFinalScore > gameDay.sameDayGames[i].actual.homeFinalScore ?
    //             (thisGameAway.outcome = 'W', thisGameHome.outcome = 'L') : (thisGameAway.outcome = 'L', thisGameHome.outcome = 'W')

    //         thisGameAway.pointDifferential= gameDay.sameDayGames[i].actual.awayFinalScore - gameDay.sameDayGames[i].actual.homeFinalScore

    //         thisGameHome.pointDifferential = gameDay.sameDayGames[i].actual.homeFinalScore - gameDay.sameDayGames[i].actual.awayFinalScore

            // teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0 ?
            //     thisGameAway.pointDifferentialRunning = 
            //     teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].pointDifferentialRunning + thisGameAway.pointDifferential
            //     : thisGameAway.pointDifferentialRunning = thisGameAway.pointDifferential

            // if(currentDate.getDate() == 21){
            //     console.log(JSON.stringify(gameDay.sameDayGames[i]))
            // }
            // teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0 ?
            // thisGameHome.pointDifferentialRunning = 
            // teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].pointDifferentialRunning + thisGameHome.pointDifferential
            // : thisGameHome.pointDifferentialRunning = thisGameHome.pointDifferential

            // teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0 ?
            //     [thisGameAway.roadTripIncluding, thisGameAway.homestandIncluding] = 
            //     [teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].roadTripIncluding + 1, 0] : [1, 0]

            // teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0 ?
            // [thisGameHome.homestandIncluding, thisGameHome.roadTripIncluding] = 
            // [teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].homestandIncluding + 1, 0] : [1, 0]

            // thisGameAway.streaks = {}
            // thisGameHome.streaks = {}
            // if(teamTracker[gameDay.sameDayGames[i].general.away].games.length > 0){
                
            //     if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].outcome == 'W'){
            //         teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.general > -1 ?
            //         thisGameAway.streaks.general += 1 : thisGameAway.streaks.general = 1
            //         if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].context == 'A'){
            //             thisGameAway.streaks.home = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home
            //             teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away > -1 ?
            //             thisGameAway.streaks.away += 1 : thisGameAway.streaks.away = 1
            //         } else {
            //             thisGameAway.streaks.away = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away
            //             teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home > -1 ?
            //             thisGameAway.streaks.home += 1 : thisGameAway.streaks.home = 1
            //         }

            //     } else {
            //         teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.general < -1 ?
            //         thisGameAway.streaks.general -= 1 : thisGameAway.streaks.general = -1
                
            //         if(teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].context == 'A'){
            //             thisGameAway.streaks.home = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home
            //             teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away < -1 ?
            //             thisGameAway.streaks.away -= 1 : thisGameAway.streaks.away = -1
            //         } else {
            //             thisGameAway.streaks.away = teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.away
            //             teamTracker[gameDay.sameDayGames[i].general.away].games[gameDay.sameDayGames[i].general.gameNumberAway - 2].streaks.home < -1 ?
            //             thisGameAway.streaks.home -= 1 : thisGameAway.streaks.home = -1
            //         }

            //     }  
            // } else {
            //     thisGameAway.streaks = {
            //         'general': 0,
            //         'away': 0,
            //         'home': 0
            //     }
            // }

            // if(teamTracker[gameDay.sameDayGames[i].general.home].games.length > 0){
            //     if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].outcome == 'W'){
            //         teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.general > -1 ?
            //         thisGameHome.streaks.general += 1 : thisGameHome.streaks.general = 1
            //         if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].context == 'A'){
            //             thisGameHome.streaks.home = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home
            //             teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away > -1 ?
            //             thisGameHome.streaks.away += 1 : thisGameHome.streaks.away = 1
            //         } else {
            //             thisGameHome.streaks.away = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away
            //             teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home > -1 ?
            //             thisGameHome.streaks.home += 1 : thisGameHome.streaks.home = 1
            //         }

            //     } else {
            //         teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome- 2].streaks.general < -1 ?
            //         thisGameHome.streaks.general -= 1 : thisGameHome.streaks.general = -1
                
            //         if(teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].context == 'A'){
            //             thisGameHome.streaks.home = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home
            //             teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away < -1 ?
            //             thisGameHome.streaks.away -= 1 : thisGameHome.streaks.away = -1
            //         } else {
            //             thisGameHome.streaks.away = teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.away
            //             teamTracker[gameDay.sameDayGames[i].general.home].games[gameDay.sameDayGames[i].general.gameNumberHome - 2].streaks.home < -1 ?
            //             thisGameHome.streaks.home -= 1 : thisGameHome.streaks.home = -1
            //         }
            //     } 
            // } else {
            //     thisGameHome.streaks = {
            //         'general': 0,
            //         'away': 0,
            //         'home': 0
            //     }
            // }

        //     teamTracker[gameDay.sameDayGames[i].general.away].games.push(thisGameAway)
        //     teamTracker[gameDay.sameDayGames[i].general.home].games.push(thisGameHome)
        // } catch(err){
        //     console.log(err)
        //     console.log(`${i}: ${JSON.stringify(gameDay.sameDayGames[i], null, 2)}`)
        //     let errorsText = `Error_${gameDay.sameDayGames[i].general.away}_at_${gameDay.sameDayGames[i].home}`
        //         let errorsFile =  `./json/TeamTrackers/${errorsText}.json`
        //         fileSystem.outputFile(errorsFile, JSON.stringify(gameDay.sameDayGames[i], null, 2), (error) => {
        //             if(error) console.log(error)
        //         })
        //     continue
        // }
    
    // }

    // return teamTracker

// }
}
updateTeamTracker()
