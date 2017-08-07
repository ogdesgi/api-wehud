'use strict'

let read = app => {
    let errs = app.errors
    let Event = app.models.event
    
    let task = (req, res) => {
        const EXCEPTION = () => res.status(500).json({ error: errs.ERR_SERVER })
        const RESPONSE = event => {
            if (!event)
                res.status(404).json({ error: errs.ERR_NOTFOUND })
            else
                res.status(200).json(event)
        }
        
        let eventId = req.params.eventId
        
        if (!eventId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = Event.findById(eventId)
        let promise = query.exec()
        
        promise.then(RESPONSE).catch(EXCEPTION)
    }
    
    return task
}

module.exports = read