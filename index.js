const path = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mysql = require('mysql')
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http').Server(app);
const socket = require('socket.io')

const user_func = require('./api/users')
const penjualan = require('./api/penjualan')
const log_func = require('./function/logger') // call Logger function


const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`Listen port on : http://localhost:${PORT}`)
})
// Socket setup
const io = socket(server)

// konfigurasi koneksi
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penjualan'
})

conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql connected...');
})



app.use(require("express-session")({
    secret: "The milk would do that",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(function (req, res, next) {
    res.locals.message = req.flash();
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static(__dirname + '/public'));

// Set sessin to cookie
app.use(session({ secret: 'ssshhhhh' }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});


//route untuk menampilkan form login
app.get('/login', (req, res) => {
    res.render('login');
});

// route untuk logout
app.get('/logout', (req, res) => {
    sess = req.session;
    let data_log = {
        User_id: sess.iduser,
        Log: 'Logout Successfuly',
        Tgl: new Date().toLocaleString()
    }
    log_func.Logger(data_log) // Insert log into table log

    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login');
    });
});

//route untuk submit login
let sess;
app.post('/login', (req, res) => {
    let data = { username: req.body.username, password: req.body.password };
    let sql = "SELECT * FROM users WHERE username='" + data.username + "' And password='" + data.password + "'";
    let query = conn.query(sql, (err, results) => {
        if (results.length != 0) {
            sess = req.session;
            sess.nama = results[0].nama_user;
            sess.level = results[0].level;
            sess.status = results[0].status;
            sess.iduser = results[0].id_user;
            let data_log = {
                User_id: results[0].id_user,
                Log: 'Login Successfuly',
                Tgl: new Date().toLocaleString()
            }
            log_func.Logger(data_log) // Insert log into table log
            res.redirect('/');
        } else {
            let data_log = {
                User_id: data.username,
                Log: 'Login Error',
                Tgl: new Date().toLocaleString()
            }
            log_func.Logger(data_log) // Insert log into table log
            res.render('login', {
                message: { error: true, content: 'Username Password tidak cocok !' },
            })
        }
    });
});

// fungsi untuk check sessin apabila available
function loggedIn(req, res, next) {
    sess = req.session;
    if (sess.nama) {
        next();
    } else {
        res.render('login', {
            message: { error: true, content: 'Login dulu !' },
        })
    }
}

//route untuk home kasir
app.get('/', loggedIn, (req, res) => {
    sess = req.session;

    res.render('index', {
        nama: sess.nama,
        level: sess.level,
        iduser: sess.iduser,
    })

});

//route untuk menampilkan barang di kasir
app.get('/listbarang', (req, res) => {
    let sql = 'SELECT * FROM barang WHERE stock > 0'
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results)
    });
})

//route untuk menambah item ke tabel pembelian
app.post('/getDetailBarang', (req, res) => {
    let r = req.body
    let sql = 'SELECT * FROM barang WHERE code_barang =' + r.code_barang
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results)
    });
})

//route untuk menyimpan penjualan
app.post('/savepembelian', (req, res) => {
    let r = req.body
    //console.log(r)
    let sqlcode = 'SELECT code_penjualan FROM penjualan ORDER BY id_penjualan DESC LIMIT 1;'
    conn.query(sqlcode, (err, results) => {
        if (err) throw err;
        code = results[0].code_penjualan
        if (r.dataArray != null) {
            for (let i = 0; i < r.dataArray.length; i++) {
                let sql = "INSERT INTO penjualan set ?";
                let data = {
                    code_penjualan: Number(code) + 1,
                    tgl_penjualan: r.tgl_penjualan,
                    jml_barang: r.dataArray[i].jumlah,
                    total: r.dataArray[i].total,
                    id_pembeli: 'P001',
                    id_karyawan: r.id_karyawan,
                    code_barang: r.dataArray[i].code_barang
                }
                let query = conn.query(sql, data, (err, results) => {
                    if (err) throw err;
                    updateStock(data.code_barang, data.jml_barang)
                });
            }
            res.json({ status: 'berhasil' })
            sess = req.session;
            let data_log = {
                User_id: sess.iduser,
                Log: `Successfuly save order with code penjualan ${Number(code) + 1}`,
                Tgl: new Date().toLocaleString()
            }
            log_func.Logger(data_log) // Insert log into table log
        }
    });
})

function updateStock(code, jumlah) {
    let sqlstock = `SELECT stock FROM barang WHERE code_barang = '${code}' ORDER BY id_barang DESC LIMIT 1`;
    conn.query(sqlstock, (err, results) => {
        if (err) throw err;
        stock = results[0].stock
        stock_baru = Number(stock) - Number(jumlah)
        let sql = `UPDATE barang SET stock='${stock_baru}' WHERE code_barang = '${code}' `
        let query = conn.query(sql, (err, results) => {
            if (err) throw err;
            console.log('update stock berhasil')
        });
    })

}


//route untu menampilkan barang
app.get('/barang', loggedIn, (req, res) => {
    sess = req.session;
    let sql = 'SELECT * FROM barang'
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.render('barang', {
            results,
            nama: sess.nama,
            level: sess.level,
            iduser: sess.iduser,
        })
        //res.json(results)
    });
})

//route untuk save barang
app.post('/savebarang', (req, res) => {
    let r = req.body;
    let data = req.body.datasend
    console.log(data)
    let sql = "INSERT INTO barang set ?";
    let query = conn.query(sql, data, (err, results) => {
        if (err) throw err;

        req.flash("success", "Save barang berhasil !");
        res.json({ status: 'berhasil' });
        sess = req.session;
        let data_log = {
            User_id: sess.iduser,
            Log: `Successfuly insert barang with code_barang: ${data.code_barang}`,
            Tgl: new Date().toLocaleString()
        }
        log_func.Logger(data_log) // Insert log into table log
    });
});

//route untuk update barang
app.post('/updatebarang', (req, res) => {
    let r = req.body;
    let data = req.body.datasend
    //console.log(data)
    let sql = `UPDATE barang SET code_barang="${data.code_barang}", nama_barang="${data.nama_barang}", harga_beli="${data.harga_beli}",
                harga="${data.harga}", merk="${data.merk}", stock="${data.stock}", expire="${data.expire}" WHERE id_barang="${r.id_barang}"; `
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;

        req.flash("success", "Update barang berhasil !");
        res.json({ status: 'berhasil' });
        sess = req.session;
        let data_log = {
            User_id: sess.iduser,
            Log: `Successfuly update barang with code_barang: ${data.code_barang}`,
            Tgl: new Date().toLocaleString()
        }
        log_func.Logger(data_log) // Insert log into table log
    });
});

//route untu menampilkan users
app.get('/users', loggedIn, (req, res) => {
    sess = req.session;
    let sql = 'SELECT * FROM users'
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.render('users', {
            results,
            nama: sess.nama,
            level: sess.level,
            iduser: sess.iduser,
        })
        //res.json(results)
    });
})

//route untu menampilkan charts
app.get('/charts', loggedIn, (req, res) => {
    sess = req.session;
    res.render('charts', {
        nama: sess.nama,
        level: sess.level,
        iduser: sess.iduser,
    })
})


// Call file api/users.js send json data
app.get('/users_api', (req, res) => {
    user_func.getAllUsers()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/user_api', (req, res) => {
    user_func.getUser(req.query)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

// Mengambil data penjualan dari api/penjualan.js
app.post('/penjualan', (req, res) => {
    penjualan.getDataPenjualan(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})