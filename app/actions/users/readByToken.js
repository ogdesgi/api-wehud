'use strict'

let read = app => {
    let errs = app.errors
    let User = app.models.user
    
    let task = (req, res) => {
        const EXCEPTION = () => res.status(500).json({ error: errs.ERR_SERVER })
        const RESPONSE = (user) => {
            if (!user)
                res.status(404).json({ error: errs.NOTFOUND })
            else
                res.status(200).json(user)
        }
        
        let currentUserId = req.session.user._id
        
        if (!currentUserId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = User.findById(currentUserId)
        let promise = query.exec()
        
        promise.then(RESPONSE).catch(EXCEPTION);
    };
    
    return task
};

module.exports = read