const express = require('express')
const Todo = require('../models/todo')
const auth = require('../middleware/authentication')
const router = new express.Router()

//add todo
router.post('/todos', auth, async (req, res) => {
    const todo = new Todo({...req.body, userId: req.user._id})
    try {
        await todo.save()
        res.status(201).send(todo)
    } catch (e) {
        res.status(400).send(e)
    }
})

//get todo by login user *********
router.get('/todos', auth, async (req, res) => {
    try {
        await req.user.populate('todos').execPopulate()
        res.send(req.user.todos)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get todo by its id
router.get('/todos/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const todo = await Todo.findOne({ _id, userId: req.user._id })
        if (!todo) {
            return res.status(404).send()
        }
        res.send(todo)
    } catch (e) {
        res.status(500).send()
    }
})

//edit todo by its id and login user
router.patch('/todos/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'body', 'tag', 'createdAt', 'updatedAt']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id})
        if (!todo) {
            return res.status(404).send()
        }
        updates.forEach((update) => {
            todo[update] = req.body[update]
            todo.updatedAt = Date.now();
        })
        await todo.save()
        res.send(todo)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete todo by its id and login user
router.delete('/todos/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        if (!todo) {
            res.status(404).send()
        }
        res.send(todo)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router