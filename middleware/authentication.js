const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') //ltoken l b3tha fl postman
        const decoded = jwt.verify(token, 'thisismynewuser') //ensure token using secret key
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) { //user not found
            throw new Error()
        }
        req.token = token //user found
        req.user = user
        next() //34an ynfz l b3di
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' }) //401 unauthorized
    }
}

module.exports = auth