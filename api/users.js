const mysql = require('mysql')

// konfigurasi koneksi
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penjualan'
})

const getAllUsers = () => {
    return new Promise(function (resolve, reject) {
        conn.query('SELECT * FROM users', (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

const getUser = (body) => {
    const { id } = body
    return new Promise(function (resolve, reject) {
        conn.query(`SELECT * FROM users WHERE id_user = ${id}`, (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

module.exports = {
    getAllUsers,
    getUser,
}