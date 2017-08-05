'use strict'

const HTTP = require('node-rest-client').Client
const KEY = 'QCrOQyWAwpmshonPiaT0GIwwI4ivp1iUkW4jsn39byWge6OqTd'

const BASEURL = 'https://igdbcom-internet-game-database-v1.p.mashape.com'
const GAMES = BASEURL + '/games'
const DEVELOPERS = BASEURL + '/companies'
const PUBLISHERS = BASEURL + '/companies'
const FRANCHISES = BASEURL + '/franchises'
const MODES = BASEURL + '/game_modes'
const GENRES = BASEURL + '/genres'

const CRITERIA = 'name,storyline,status,developers,publishers,franchise,game,game_modes,genres,first_release_date,cover'

const EXCEPTION = x => res.status(500).json({ error: errs.ERR_SERVER })

let create = function(app) {
    let errs = app.errors
    let Game = app.models.game
    
    var http = new HTTP()
        
    let request = function(req, res) {
        
        let params = {
            fields: CRITERIA,
            limit: '50',
            offset: '1'
        }
        
        let args = {
            parameters: params,
            headers: { 'X-Mashape-Key': KEY }
        }
        
        http.get(GAMES + '/', args, (data, body) => {
            data.forEach(entry => {
                let hasDevs = false
                let hasPublishers = false
                let hasFranchise = false
                let hasGame = false
                let hasModes = false
                let hasGenres = false
                
                let newGame = new Game()
                newGame.name = entry.name
                                
                if (entry.hasOwnProperty('storyline'))
                    newGame.synopsis = entry.storyline
                
                if (entry.hasOwnProperty('status'))
                    newGame.status = entry.status
                
                if (entry.hasOwnProperty('developers')) hasDevs = true
                
                if (entry.hasOwnProperty('publishers')) hasPublishers = true
                
                if (entry.hasOwnProperty('franchise')) hasFranchise = true
                
                if (entry.hasOwnProperty('first_release_date')) 
                    newGame.firstReleaseDate = entry.first_release_date
                
                if (entry.hasOwnProperty('cover'))
                    if (entry.cover.url.startsWith('//'))
                        newGame.cover = entry.cover.url.substring(2)
                    else
                        newGame.cover = entry.cover.url
                
                if (entry.hasOwnProperty('game')) {
                    newGame.isDlcOrExpansion = true
                    hasGame = true
                }
                
                if (entry.hasOwnProperty('game_modes')) hasModes = true
                
                if (hasDevs) {
                    entry.developers.forEach(developer => {
                        
                        let args = {
                            parameters: { fields: 'name' },
                            path: { 'dev': developer },
                            headers: { 'X-Mashape-Key': KEY }
                        }
                        
                        newGame.developers = []
                        http.get(DEVELOPERS + '/${dev}/', args, (data, body) => {
                            data.forEach(dev => {
                                if (!newGame.developers.includes(dev.name))
                                    newGame.developers.push(dev.name)
                                
                                // There is only one developer per ID.
                                if (!hasPublishers && !hasFranchise && 
                                    !hasGame && !hasModes &&
                                    !hasGenres) 
                                    newGame.save().catch(EXCEPTION)
                            })
                        })
                    })
                }
                
                if (hasPublishers) {
                    entry.publishers.forEach(publisher => {
                        
                        let args = {
                            parameters: { fields: 'name' },
                            path: { 'pub': publisher },
                            headers: { 'X-Mashape-Key': KEY }
                        }
                        
                        newGame.publishers = []
                        http.get(PUBLISHERS + '/${pub}/', args, (data, body) => {
                            data.forEach(dev => {
                                if (!newGame.publishers.includes(dev.name))
                                    newGame.publishers.push(dev.name)
                                
                                // There is only one publisher per ID.
                                if (!hasFranchise && !hasGame &&
                                    !hasModes && !hasGenres) 
                                    newGame.save().catch(EXCEPTION)
                            })
                        })
                    })
                }
                
                if (hasFranchise) {
                    let args = {
                        parameters: { fields: 'name' },
                        path: { 'fra': entry.franchise },
                        headers: { 'X-Mashape-Key': KEY }
                    }

                    http.get(FRANCHISES + '/${fra}/', args, (data, body) => {
                        data.forEach(fra => {
                            
                            // There is only one franchise.
                            newGame.franchise = fra.name
                            if (!hasGame && !hasModes &&
                                !hasGenres) 
                                newGame.save().catch(EXCEPTION)
                        })
                    })
                }
                
                if (hasGame) {
                    let args = {
                        parameters: { fields: 'name' },
                        path: { 'gam': entry.game },
                        headers: { 'X-Mashape-Key': KEY }
                    }

                    http.get(GAMES + '/${gam}/', args, (data, body) => {
                        data.forEach(gam => {
                            
                            // There is only one main game.
                            newGame.mainGame = gam.name
                            if (!hasModes && !hasGenres) 
                                newGame.save().catch(EXCEPTION)
                        })
                    })
                }
                
                if (hasModes) {
                    entry.game_modes.forEach(mode => {
                        
                        let args = {
                            parameters: { fields: 'name' },
                            path: { 'mod': mode },
                            headers: { 'X-Mashape-Key': KEY }
                        }
                        
                        newGame.modes = []
                        http.get(MODES + '/${mod}/', args, (data, body) => {
                            data.forEach(mod => {
                                if (!newGame.modes.includes(mod.name))
                                    newGame.modes.push(mod.name)
                                
                                // There is only one game mode per ID.
                                if (!hasGenres) 
                                    newGame.save().catch(EXCEPTION)
                            })
                        })
                    })
                }
                
                if (hasGenres) {
                    entry.genres.forEach(genre => {
                        
                        let args = {
                            parameters: { fields: 'name' },
                            path: { 'gen': genre },
                            headers: { 'X-Mashape-Key': KEY }
                        }
                        
                        newGame.genres = []
                        http.get(GENRES + '/${gen}/', args, (data, body) => {
                            data.forEach(gen => {
                                if (!newGame.genres.includes(gen.name))
                                    newGame.genres.push(gen.name)
                                
                                // There is only one game genre per ID.
                                newGame.save().catch(EXCEPTION)
                            })
                        })
                    })
                }
                
                if (!hasDevs && !hasPublishers && 
                    !hasFranchise && !hasGame &&
                    !hasModes && !hasGenres) 
                    newGame.save().catch(EXCEPTION)
            })
            
            res.status(204).send()
        })
    }
    
    return request
}

module.exports = create