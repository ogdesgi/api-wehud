'use strict'

let read = app => {
    let errs = app.errors
    let User = app.models.user
    
    let task = (req, res) => {
        const EXCEPTION = () => { return res.status(500).json({ error: errs.ERR_SERVER }) }
        const RESPONSE = user => {
            if (!user)
                return res.status(404).json({ error: errs.NOTFOUND })
            
            return res.status(200).json(user)
        }
        
        let userId = req.params.userId
        
        if (!userId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = User.findById(userId)
        let promise = query.exec()
        
        promise.catch(EXCEPTION).done(RESPONSE)
    };
    
    return task
};

module.exports = read