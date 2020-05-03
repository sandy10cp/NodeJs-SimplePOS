const mysql = require('mysql')
const date_func = require('../function/date') // call function short_months()

// konfigurasi koneksi
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penjualan'
})

const getDataPenjualan = (body) => {
    const { tglstart, tglend } = body
    let sql = ` SELECT SUM(total) as total, replace(SUBSTRING(tgl_penjualan, 1, 10), ',', '') as tgl_penjualan 
                FROM penjualan 
                WHERE replace(SUBSTRING(tgl_penjualan, 1, 10), ',', '') 
                BETWEEN '${tglstart}' AND '${tglend}' 
                GROUP BY replace(SUBSTRING(tgl_penjualan, 1, 10), ',', '')`

    return new Promise(function (resolve, reject) {
        conn.query(sql, (error, results) => {
            if (error) {
                reject(error)
            }

            let tot = []
            let tgl = []
            for (var i = 0; i < results.length; i++) {
                let date = new Date(results[i].tgl_penjualan)
                tgl_lengkap = date.getDate() + ' ' + date_func.short_months(date)
                tot.push(results[i].total / 100)
                tgl.push(tgl_lengkap)

            }
            let kirim = {
                tot,
                tgl,
            }
            //console.log(kirim)
            resolve(kirim)

        })
    })
}

module.exports = {
    getDataPenjualan,

}