'use strict'

const Q = require('q')

let pages = app => {
    let errs = app.errors
    let Page = app.models.page
    let Post = app.models.post
    
    let task = (req, res) => {
        const EXCEPTION = () => { return res.status(500).json({ error: errs.ERR_SERVER }) }
        const RESPONSE = pages => {
            let results = []
            let proms = []
            pages.forEach(page => {
                page.posts = []
                let ownerId = page.owner._id.toString()
                if (ownerId === userId) {
                    results.push(page)

                    let promises = []
                    if (page.users.length > 0) {
                        page.users.forEach(userId => {
                            let uId = userId.toString()
                            let query = Post.find({ 'publisher._id': uId })
                            let promise = query.exec()
                            promises.push(promise)
                        })
                    }
                    
                    if (page.games.length > 0) {
                        page.games.forEach(gameId => {
                            let gId = gameId.toString()
                            let query = Post.find({ 'game._id': gId })
                            let promise = query.exec()
                            promises.push(promise)
                        })
                    }
                    
                    if (promises.length > 0) {
                        let prom = Q.all(promises)
                        proms.push(prom)
                    }
                }
            })
            
            if (proms.length > 0) {
                Q.all(proms).then(values => {
                    let pageList = []
                    values = app.modules.utils.flatten(values)
                    values.forEach(value => {
                        results.forEach(page => {
                            if (page.users.length > 0) {
                                page.users.forEach(userId => {
                                    let uId = userId.toString()
                                    if (uId === value.publisher._id) {
                                        page.posts.push(value)
                                    }
                                })
                            }

                            if (page.games.length > 0) {
                                page.games.forEach(gameId => {
                                    let gId = gameId.toString()
                                    if (value.opinion)
                                        if (gId === value.game._id)
                                            page.posts.push(value)
                                })
                            }
                                                        
                            if (!pageList.includes(page)) pageList.push(page)
                        })
                    })
                    
                    return res.status(200).json(pageList)
                })
            } else return res.status(200).json(results)
        }
        
        let userId = req.params.userId
        
        if (!userId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = Page.find()
        let promise = query.exec()
        
        promise.catch(EXCEPTION).done(RESPONSE)
    }
    
    return task
}

module.exports = pages