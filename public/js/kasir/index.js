const btnSrc = document.querySelector('#src');

btnSrc.addEventListener('click', getListBarang())

async function getListBarang() {
    const url = '/listbarang'
    await fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            let string = `<table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Code Barang</th>
                            <th scope="col">Nama Barang</th>
                            <th scope="col">Stock</th>
                            <th scope="col"> </th>

                        </tr>
                    </thead>`;

            $.each(data, function (key, value) {
                string += `
                <tbody id="modalListBarang">
                    <tr id='select' data-code="${value.code_barang}" data-dismiss="modal">
                        <td>${value.code_barang}</td>
                        <td>${value.nama_barang}</td>
                        <td>${value.stock}</td>
                        <td>
                        <a href="#" data-code="${value.code_barang}"  id="pilih" data-dismiss="modal" class="btn btn-small btn-success"><i class="btn-icon-only  icon-ok"> </i></a>
                        </td>
                    </tr>`;
            });
            string += `</tbody>
                    </table>`;
            document.querySelector('.modal-body').innerHTML = string

            const btnPilihBarang = document.querySelectorAll('#pilih')
            btnPilihBarang.forEach(function (listBarang) {
                listBarang.addEventListener('click', function () {
                    let codeBarang = this.getAttribute('data-code')
                    document.querySelector('#cbarang').value = codeBarang
                })
            })

            const btnSelectBarang = document.querySelectorAll('#select')
            btnSelectBarang.forEach(function (listBarang) {
                listBarang.addEventListener('click', function () {
                    let codeBarang = this.getAttribute('data-code')
                    document.querySelector('#cbarang').value = codeBarang
                })
            })

        })
        .catch((error) => {
            console.log(error);
        });
}

// Button for add to table pembelian
let dataArray = []
const btnAddPembelian = document.querySelector('#add_pembelian')
btnAddPembelian.addEventListener('click', function (e) {
    e.preventDefault()
    const cbarang = document.querySelector('#cbarang').value
    const jumlah = document.querySelector('#jumlah').value
    if (cbarang == '' || jumlah == '') {
        alert('Input code barang dan jumlah barang')
    } else {
        let dataObj = {};
        let datasend = { code_barang: cbarang }

        if (localStorage.ItemPenjualan) {
            dataArrayCek = JSON.parse(localStorage.ItemPenjualan)
            //Find index of specific object using findIndex method.    
            objIndex = dataArrayCek.findIndex((obj => obj.code_barang == cbarang));

            if (objIndex >= 0) {
                dataArrayCek[objIndex].jumlah = Number(dataArrayCek[objIndex].jumlah) + Number(jumlah)
                dataArrayCek[objIndex].total = dataArrayCek[objIndex].jumlah * dataArrayCek[objIndex].harga

                //Log object to console again.
                console.log("After update: ", dataArrayCek[objIndex])

                localStorage.setItem('ItemPenjualan', JSON.stringify(dataArrayCek));
                loadDataLocal()
            } else {
                const url = '/getDetailBarang'
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(datasend) // body data type must match 'Content-Typ' header
                })
                    .then((resp) => resp.json())
                    .then((data) => {

                        $.each(data, function (key, value) {
                            var tot = value.harga * jumlah
                            dataObj = {
                                code_barang: value.code_barang,
                                nama_barang: value.nama_barang,
                                harga: value.harga,
                                jumlah: jumlah,
                                total: tot
                            }
                        })
                        dataArray.push(dataObj)
                        localStorage.ItemPenjualan = JSON.stringify(dataArray)

                        console.log(dataArray)
                        loadDataLocal()

                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }


        } else {

            const url = '/getDetailBarang'
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(datasend) // body data type must match 'Content-Typ' header
            })
                .then((resp) => resp.json())
                .then((data) => {

                    $.each(data, function (key, value) {
                        var tot = value.harga * jumlah
                        dataObj = {
                            code_barang: value.code_barang,
                            nama_barang: value.nama_barang,
                            harga: value.harga,
                            jumlah: jumlah,
                            total: tot
                        }
                    })
                    dataArray.push(dataObj)
                    localStorage.ItemPenjualan = JSON.stringify(dataArray)

                    console.log(dataArray)
                    loadDataLocal()

                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
    //window.location.reload();
})
// Load data dari localStorage ke tabel
loadDataLocal()
function loadDataLocal() {
    document.querySelector('#tb_pembelian').innerHTML = ''
    let sum = 0
    if (localStorage.ItemPenjualan) {
        dataArray = JSON.parse(localStorage.ItemPenjualan)
        for (var i = 0; i < dataArray.length; i++) {
            sum = Number(dataArray[i].total) + Number(sum);
            //cardTablePembelian(i, dataArray[i].code_barang, dataArray[i].nama_barang, dataArray[i].harga, dataArray[i].jumlah, dataArray[i].total)
            string = `<tr id="tr">
                    <td>${dataArray[i].code_barang}</td>
                    <td>${dataArray[i].nama_barang}</td>
                    <td>${dataArray[i].harga}</td>
                    <td id="jumlahItem" data-id="${i}" contenteditable="true">${dataArray[i].jumlah}</td>
                    <td id="row_harga">${dataArray[i].total}</td>
                    <td>
                    <button url="./admin/print" data-id="${i}" class="btn btn-danger btn-small btn-delete-item"><i class="btn-icon-only icon-remove"> </i></button>
                    </td>
                </tr>`
            document.querySelector('#tb_pembelian').innerHTML += string
        }

        let number_string = sum.toString(),
            sisa = number_string.length % 3,
            rupiah = number_string.substr(0, sisa),
            ribuan = number_string.substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        document.querySelector('#tot_pembelian').innerHTML = rupiah
        //$('#tot_pembelian').html(sum)

    }

}

// Tampilkan ke tabel
function cardTablePembelian(index, code_barang, nama_barang, harga, jumlah, total) {
    let string = ''
    string = `<tr id="tr">
                <td>${code_barang}</td>
                <td>${nama_barang}</td>
                <td>${harga}</td>
                <td id="jumlahItem" data-id="${index}" data-jumlah="${jumlah}" contenteditable="true">${jumlah}</td>
                <td id="row_harga">${total}</td>
                <td>
                    <button url="./admin/print" data-id="${index}" class="btn btn-danger btn-small btn-delete-item"><i class="btn-icon-only icon-remove"> </i></button>
                </td>
            </tr>`
    document.querySelector('#tb_pembelian').innerHTML += string

}

// Edit jumlah item di tabel pembelian
const jumlahITem = document.querySelectorAll('#jumlahItem')
jumlahITem.forEach(function (item) {
    item.addEventListener('keyup', function (e) {
        let id = this.getAttribute('data-id')
        let jumlah = this.textContent

        if (e.which == 13) {
            e.preventDefault()

            dataArray = JSON.parse(localStorage.ItemPenjualan)
            dataArray[id].jumlah = jumlah
            dataArray[id].total = jumlah * dataArray[id].harga

            localStorage.setItem('ItemPenjualan', JSON.stringify(dataArray));
            window.location.reload();
        }
    })
})

// Button delete item di tabel pembelian
const btnDeleteItem = document.querySelectorAll('.btn-delete-item')
btnDeleteItem.forEach(function (btnIdItem) {
    btnIdItem.addEventListener('click', function (e) {
        e.preventDefault()
        let id = this.getAttribute('data-id')
        console.log(id)
        dataArrayDelete = JSON.parse(localStorage.ItemPenjualan)
        dataArrayDelete.splice(id, 1)
        localStorage.ItemPenjualan = JSON.stringify(dataArrayDelete)
        loadDataLocal()
        window.location.reload();
    })
})

// Input pembayaran tunai
const inputBayarTunai = document.querySelector('#tunai')
const textKembalian = document.querySelector('#kembali')
inputBayarTunai.addEventListener('input', function (e) {
    e.preventDefault()
    let totalPembelian = document.querySelector('#tot_pembelian').textContent
    total = totalPembelian.split('.').join('');
    const bayarTunai = inputBayarTunai.value
    if (bayarTunai == '') {
        textKembalian.innerHTML = ''
    } else {
        textKembalian.innerHTML = Number(bayarTunai) - Number(total)
    }
})


// Button proses pembelian
const btnProsesPembelian = document.querySelector('#proses')
btnProsesPembelian.addEventListener('click', function () {
    if (!localStorage.ItemPenjualan) {
        swal("Opss...", "Masukkan pembelian", "warning")
    }
    else if (Number(textKembalian.textContent) < 0 || textKembalian.textContent == '') {
        swal("Opss...", "Masukkan pembayaran", "warning")
    } else {
        dataArray = JSON.parse(localStorage.ItemPenjualan)
        let id_kasir = document.querySelector('#id_karyawan').value
        let totalPembelian = document.querySelector('#tot_pembelian').textContent
        let total = totalPembelian.split('.').join('');
        let bayarTunai = inputBayarTunai.value

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth(); //Be careful! January is 0 not 1
        var year = currentDate.getFullYear();
        var timestamp = currentDate.getTime();
        //let datenew = year + '/' + (month + 1) + '/' + date
        let datenew = currentDate.toLocaleString();

        //console.log(dataArray)
        const url = '/savepembelian'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
                dataArray,
                id_karyawan: id_kasir,
                tgl_penjualan: datenew,
                totalPembelian: total,
                bayarTunai,
                kembalian: textKembalian.textContent
            }) // body data type must match 'Content-Typ' header
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log(data);
                swal("Success", "Penjualan berhasil !", "success")
                    .then((value) => {
                        window.location.reload();
                    });
                localStorage.clear()
            })
            .catch((error) => {
                console.log(error);
            });
    }
})

