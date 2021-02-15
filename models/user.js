const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Todo = require('./todo')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 15,
        optional: true
    },
    age: {
        type: Number,
        optional: true,
        minLength: 13
    },
    //array to store tokens if user login from multiple devices
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

//relationship to Todo
userSchema.virtual('todo', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'userId'
})

//
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) { //must be regular func for (this)
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next() //34an ykml b3di
})

//generate token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewuser')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//verify login
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

// Delete user todo when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Todo.deleteMany({ userId: user._id })
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User