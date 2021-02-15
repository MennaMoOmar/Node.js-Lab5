const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/authentication')
const Todo = require('../models/todo')
const router = new express.Router()

//register
router.post('/users/register', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save(); //hy4fr l pw l awl abl my5zno fl DB
        const token = await user.generateAuthToken(); //hy3mlo token
        res.status(201).send("user was registered successfully");
    } catch (e) {
        res.status(400).send(e);
    }
})

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken(); //m3 kol login mn device mo5tlf hy3mlo token gdeda
        res.send(`logged in successfully \n token: ${token} \n user name: ${user.username}`)
        //res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token //hyms7 l token lma l user y3ml logout
        })
        await req.user.save()
        res.send("logout successfuly")
    } catch (e) {
        res.status(500).send()
    }
})

//logout all (from all devices)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [] //hms7 kol l tokens
        await req.user.save()
        res.send("logout from all devices sucessfully")
    } catch (e) {
        res.status(500).send()
    }
})

//profile
router.get('/users/profile', auth, async (req, res) => {
    res.send(req.user)
});

//Return the first name of registered users
router.get('/users', auth, async (req, res) => {
    res.send(req.user.firstName)
});

//Edit user by id & login
router.patch('/users/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'password','firstName', 'age'] //34an my3dl4 7aga tanya
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' }) //400 bad request
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Edit the login user
router.patch('/users/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'password','firstName', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Delete user by id & login
router.delete('/users/:id', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//Delete login user
router.delete('/users/profile', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router