const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('./mysql')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function(req, res) {
    mysql.song(function(err, data) {
        if (err) {
            return console.log(err)
        }
        res.send(data)
    })
})


app.listen(3030, () => {
    console.log('server running http://localhost:3030')
})