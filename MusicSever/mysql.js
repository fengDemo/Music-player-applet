const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
})

connection.connect()

// 查询 song 表中的数据
function song(callback) {
    connection.query('SELECT * FROM *', function(error, results) {
        if (error) {
            return callback(error)
        }
        callback(null, results)
    })
}

module.exports = {
    song
}