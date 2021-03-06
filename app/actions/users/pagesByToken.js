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
                if (page.owner._id.equals(userId)) {
                    results.push(page)
                    
                    let promises = []
                    if (page.users.length > 0) {
                        page.users.forEach(userId => {
                            let query = Post.find()
                            let promise = query.exec()
                            promises.push(promise)
                        })
                    }
                    
                    if (page.games.length > 0) {
                        page.games.forEach(gameId => {
                            let query = Post.find()
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
                                    if (userId.equals(value.publisher._id))
                                        page.posts.push(value)
                                })
                            }

                            if (page.games.length > 0) {
                                page.games.forEach(gameId => {
                                    if (value.opinion)
                                        if (gameId.equals(value.game._id))
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
        
        let userId = req.session.user._id
        
        if (!userId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = Page.find()
        let promise = query.exec()
        
        promise.catch(EXCEPTION).done(RESPONSE)
    }
    
    return task
}

module.exports = pages