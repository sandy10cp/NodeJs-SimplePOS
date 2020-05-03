const mysql = require('mysql')

// konfigurasi koneksi
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penjualan'
})


const Logger = (data) => {

    return new Promise(function (resolve, reject) {
        conn.query(`INSERT INTO log set ?`, data, (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

module.exports = {
    Logger,
}