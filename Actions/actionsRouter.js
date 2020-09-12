const express = require('express')

const router = express.Router()
const db = require('../data/helpers/actionModel')
router.use('/:aId/', verifyId)

router.get('/', (req, res) => {
  db.get()
    .then(result => {
      let projectActions = null
      if (req.project) {
        projectActions = result.filter(action => action.project_id === req.project.id)
      }
      else {
        projectActions = result
      }
      res.status(200).json(projectActions)
    }).catch(err => {
      res.status(500).json({ message: 'Sorry, something went wrong' })
    })
})

router.get('/:aId/', (req, res) => {
  res.status(200).json(req.action)
})

router.post('/', verifySchema, (req, res) => {
  db.insert(req.body)
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err => {
      res.status(500).json({ message: 'Sorry, something went wrong' })
    })
})

router.put('/:aId/', verifySchema, (req, res) => {
  for (const param in req.action) {
    if (!req.body[param]) {
      req.body[param] = req.action[param]
    }
  }
  db.update(req.params.aId, req.body)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(500).json({ message: 'Sorry, something went wrong' })
    })
})

router.delete('/:aId/', (req, res) => {
  db.remove(req.params.aId)
    .then(result => {
      res.status(204).end()
    }).catch(err => {
      res.status(500).json({ message: 'Sorry, something went wrong' })
    })
})

function verifySchema(req, res, next) {
  if (req.project) {
    req.body.project_id = req.project.id
  }
  else {
    if (!req.body.project_id) {
      res.status(400).json({ message: 'please assign this action to a project' })
      return
    }
  }

  if (req.body.description && req.body.notes) {
    next()
  }
  else {
    res.status(400).json({ message: 'Please provide an object with a description and notes' })

  }
}

function verifyId(req, res, next) {
  const id = parseInt(req.params.aId)
  if (!id) {
    res.status(400).json({ message: "please provide a valid id" })
  }
  else {
    db.get(id)
      .then(result => {
        if (!result) {
          res.status(404).json({ message: "Sorry, an action with that id does not exist for this project" })
        }
        else {
          if (result.project && result.project_id !== req.project.id) {
            res.status(404).json({ message: "Sorry, an action with that id does not exist for this project" })
          }
          else {
            req.action = result
            next()
          }
        }
      })
      .catch(err => {
        res.status(500).json({ message: 'Sorry, something went wrong' })
      })
  }
}




module.exports = router