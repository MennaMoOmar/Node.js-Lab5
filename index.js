const express = require('express')
require('./db-connection')
const userRouter = require('./routers/user')
const todoRouter = require('./routers/todo')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(todoRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

/*-----------------------------------*/

//2 - Create a middleware that logs the request url, method, and current time
app.get('/*', (req, res, next) => {
    console.log(`URL= ${req.url}, Method= ${req.method}, Time= ${req.startTime = Date.now()}`);
    next();
});

// 3- Create a global error handler
app.get('/*', (req, res, next) => {
    if (!res.headersSent) {
        console.log(res.statusCode);
        console.log(req.statusCo);
        res.send("404 Error!");
    }
});