import fs from 'fs-extra';

// export default async function updateTeamTracker(gameDay, teamTracker, currentDate){
async function updateTeamTracker(){
    
    let file = '../json/TeamTrackers/TeamTracker.json'
    
    fs.readJson(file, (err, obj1) => {
       
        fs.readJson('../json/Gamedays/Gamedays.json', (err, obj) => {
            let teamTrackerNew = []
            if (err) return console.log(err);
            for(let i = 0; i < Object.keys(obj1).length; i++){
                teamTrackerNew.push({
                    "team": Object.keys(obj1)[i],
                    "games": []
                })
                
            }
            if (err) return console.log(err);
            for(let i = 0; i < obj.length; i++){
                //Game-by-Game logic goes here
                
                for(let j = 0; j < obj[i].sameDayGames.length; j++){
                    let game = obj[i].sameDayGames[j]
                    let [homeTeam, gameNumberHome, awayTeam, gameNumberAway] = 
                        [game.general.home, game.general.gameNumberHome, game.general.away, game.general.gameNumberAway] 
                    let [homeTeamIndex, awayTeamIndex] = 
                        [teamTrackerNew.findIndex(x => x.team == homeTeam), teamTrackerNew.findIndex(x => x.team == awayTeam)]
                    
                    let [dogOrFavHome, dogOrFavAway] = ['', '']
                    game.prediction.fav == 'H' ? [dogOrFavHome = 'fav', dogOrFavAway = 'dog'] : [dogOrFavHome = 'dog', dogOrFavAway = 'fav']
                    try {
                        
                        let homeWinOrLoss
                        game.actual.homeFinalScore > game.actual.awayFinalScore ? homeWinOrLoss = 'W' : homeWinOrLoss = 'L'

                        let awayWinOrLoss
                        game.actual.homeFinalScore > game.actual.awayFinalScore ? awayWinOrLoss = 'L' : awayWinOrLoss = 'W'

                        let pointDifferentialRunningHome = 0
                        let pointDifferentialRunningAway = 0
                        if(teamTrackerNew[homeTeamIndex].games.length > 0){
                            for(let m = 0; m < teamTrackerNew[homeTeamIndex].games.length; m++){
                                pointDifferentialRunningHome += teamTrackerNew[homeTeamIndex].games[m].pointDifferential
                            }
                        }

                        if(teamTrackerNew[awayTeamIndex].games.length > 0){
                            for(let m = 0; m < teamTrackerNew[awayTeamIndex].games.length; m++){
                                pointDifferentialRunningAway += teamTrackerNew[awayTeamIndex].games[m].pointDifferential
                            }
                        }       
                        let homestandIncluding
                        let roadtripIncluding 
                        teamTrackerNew[homeTeamIndex].games.length > 0 ?
                            homestandIncluding = teamTrackerNew[homeTeamIndex].games[teamTrackerNew[homeTeamIndex].games.length - 1].homestandIncluding + 1
                             : homestandIncluding = 0
                            
                        teamTrackerNew[awayTeamIndex].games.length > 0 ?
                        roadtripIncluding = teamTrackerNew[awayTeamIndex].games[teamTrackerNew[awayTeamIndex].games.length - 1].roadtripIncluding + 1
                        : roadtripIncluding = 0

                        let gameHistoryStringHome
                        let gameHistoryStringAway
                        let streakHome = 0
                        let streakAway = 0
                        gameHistoryStringHome = `-`
                    
                        if(gameNumberHome >= 2){
                            gameHistoryStringHome = teamTrackerNew[homeTeamIndex].games[gameNumberHome - 2].gameHistory
                            
                            gameHistoryStringHome += `${teamTrackerNew[homeTeamIndex].games[gameNumberHome - 2].outcome}-`
                            let count = 0
                            let lastGameResult
                            for(let i = gameHistoryStringHome.length - 2; i >= 1; i-=2){
                                if(count == 0){
                                    lastGameResult = gameHistoryStringHome[i]
                                    count++  
                                } else {
                                    if(gameHistoryStringHome[i] == lastGameResult) count++
                                    else break
                                }                                  
                            }
                            if(lastGameResult == 'L') count *= -1
                            streakHome = count
                        }
                        gameHistoryStringAway = `-`
                    
                        if(gameNumberAway >= 2){
                           
                            gameHistoryStringAway = teamTrackerNew[awayTeamIndex].games[gameNumberAway - 2].gameHistory
                            
                            gameHistoryStringAway += `${teamTrackerNew[awayTeamIndex].games[gameNumberAway - 2].outcome}-`
                            let count = 0
                            let lastGameResult
                            for(let i = gameHistoryStringAway.length - 2; i >= 1; i-=2){
                                if(count == 0){
                                    lastGameResult = gameHistoryStringAway[i]
                                    count++  
                                } else {
                                    if(gameHistoryStringAway[i] == lastGameResult) count++
                                    else break
                                }                                       
                            }
                            if(lastGameResult == 'L') count *= -1
                            streakAway = count
                        }
                        let teamTrackerHomeObj = {
                            "date": game.general.date,
                            "opponent": game.general.away,
                            "context": "H",
                            "favOrDog": dogOrFavHome,
                            "outcome": homeWinOrLoss,
                            "pointsScoredFor": game.actual.homeFinalScore,
                            "pointsScoredAgainst": game.actual.awayFinalScore,
                            "pointDifferential": game.actual.homeFinalScore - game.actual.awayFinalScore,
                            "pointDifferentialRunning": pointDifferentialRunningHome,
                            "homestandIncluding": homestandIncluding,
                            "roadtripIncluding": 0,
                            "gameHistory": `${gameHistoryStringHome}`,
                            "streak": streakHome
                        }

                        let teamTrackerAwayObj = {
                            "date": game.general.date,
                            "opponent": game.general.home,
                            "context": "A",
                            "favOrDog": dogOrFavAway,
                            "outcome": awayWinOrLoss,
                            "pointsScoredFor": game.actual.awayFinalScore,
                            "pointsScoredAgainst": game.actual.homeFinalScore,
                            "pointDifferential": game.actual.awayFinalScore - game.actual.homeFinalScore,
                            "pointDifferentialRunning": pointDifferentialRunningAway,
                            "homestandIncluding": 0,
                            "roadtripIncluding": roadtripIncluding,
                            "gameHistory": `${gameHistoryStringAway}`,
                            "streak": streakAway

                        }  
                        teamTrackerNew[homeTeamIndex].games.push(teamTrackerHomeObj)
                        teamTrackerNew[awayTeamIndex].games.push(teamTrackerAwayObj)
                        
                        
                    } catch (error) {
                        console.log(error)
                    }
            
                    
                }
                
            }
            let teamTrackerNewFile = './json/teamTrackerNew.json'
            fs.outputFile(teamTrackerNewFile, JSON.stringify(teamTrackerNew, null, 2), (error) => {
                        if(error) console.log(error)
            })
        })
        
    });
    
   
       

            

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
