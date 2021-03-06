'use strict'

let del = app => {
    let errs = app.errors
    let Post = app.models.post
    
    let task = (req, res) => {
        const EXCEPTION = () => { return res.status(500).json({ error: errs.ERR_SERVER }) }
        const RESPONSE = () => { return res.status(204).send() }
        
        let postId = req.params.postId
        
        if (!postId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = Post.findByIdAndRemove(postId)
        let promise = query.exec()
        
        promise.catch(EXCEPTION).done(RESPONSE)
    }
    
    return task
}

module.exports = del