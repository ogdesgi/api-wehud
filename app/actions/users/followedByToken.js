'use strict'

let followed = app => {
    let errs = app.errors
    let User = app.models.user
    
    let task = (req, res) => {
        const EXCEPTION = () => { return res.status(500).json({ error: errs.ERR_SERVER }) }
        const RESPONSE = users => { return res.status(200).json(users) }
        
        let query = User.find()
        let promise = query.exec()
        let userId = req.session.user._id
        
        if (!userId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let followedUsers = []
        promise.catch(EXCEPTION).done(users => {
            users.forEach(user => {
                let followers = user.followers
                followers.forEach(u => {
                    if (u._id.equals(userId)) {
                        let followedUser = {
                            _id: u._id,
                            username: u.username,
                            email: u.email
                        }
                        followedUsers.push(followedUser)
                    }
                        
                })
            })
            
            return res.status(200).json(followedUsers)
        })
    }
    
    return task
}

module.exports = followed