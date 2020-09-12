const express = require('express')

const router = express.Router()
const db = require('../data/helpers/actionModel')
router.use('/:aId/', verifyId)

router.get('/', (req, res) => {
  db.get()
    .then(result => {
      const projectActions = result.filter(action => action.project_id === req.project.id)
      res.status(200).json(projectActions)
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

function verifySchema(req, res, next) {
  req.body.project_id = req.project.id
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
          if (result.project_id !== req.project.id) {
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