'use strict'

let read = app => {
    let errs = app.errors
    let Planning = app.models.planning
    
    let task = (req, res) => {
        const EXCEPTION = () => { return res.status(500).json({ error: errs.ERR_SERVER }) }
        const RESPONSE = planning => { return res.status(200).json(planning) }
        
        let planningId = req.params.planningId
        
        if (!planningId)
            return res.status(400).json({ error: errs.ERR_BADREQUEST })
        
        let query = Planning.findById(planningId)
        let promise = query.exec()
        
        promise.catch(EXCEPTION).done(RESPONSE)
    }
    
    return task
}

module.exports = read