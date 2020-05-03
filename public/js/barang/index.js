// Button untuk edit barang
const btnEdit = document.querySelectorAll('#edit')
btnEdit.forEach(function (editBarang) {
    editBarang.addEventListener('click', function (e) {
        e.preventDefault()

        document.querySelector('#save_barang').textContent = 'Update'

        let id = this.getAttribute('data-id')
        let datasend = { code_barang: id }

        fetch('/getDetailBarang', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(datasend) // body data type must match 'Content-Typ' header
        })
            .then((resp) => resp.json())
            .then((data) => {
                //console.log(data);
                document.querySelector('#code_barang').value = data[0].code_barang
                document.querySelector('#nama_barang').value = data[0].nama_barang
                document.querySelector('#harga_beli').value = data[0].harga_beli
                document.querySelector('#harga_barang').value = data[0].harga
                document.querySelector('#merk_barang').value = data[0].merk
                document.querySelector('#stock_barang').value = data[0].stock
                document.querySelector('#expire').value = data[0].expire
                document.querySelector('#id_barang').value = data[0].id_barang
            })
            .catch((error) => {
                console.log(error);
            });

    })
})

//Button untuk reset input
const btnReset = document.querySelector('#reset')
btnReset.addEventListener('click', function (e) {
    e.preventDefault()
    window.location.reload();
})

//Save atau Update barang
const btnSave = document.querySelector('#save_barang')
const isUpdate = document.querySelector('#isUpdate')
const id_barang = document.querySelector('#id_barang')
btnSave.addEventListener('click', function (e) {
    e.preventDefault()

    let form = document.querySelector('#form_barang');
    //let data = new FormData(form)
    let data = serializeArray(form);
    let datasend = {
        code_barang: data[0].value,
        nama_barang: data[1].value,
        harga_beli: data[2].value,
        harga: data[3].value,
        merk: data[4].value,
        stock: data[5].value,
        expire: data[6].value
    }
    if (datasend.code_barang != '' || datasend.nama_barang != '' || datasend.harga_beli != '' || datasend.harga != '') {
        if (id_barang.value != '') {
            console.log('updat form')
            fetch('/updatebarang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                    datasend,
                    id_barang: id_barang.value
                }) // body data type must match 'Content-Typ' header
            })
                .then((resp) => resp.json())
                .then((data) => {
                    console.log(data);
                    swal("Success", "Update barang berhasil !", "success")
                        .then((value) => {
                            window.location.reload();
                        });
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            console.log('save form')

            fetch('/savebarang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                    datasend,
                    id_barang: id_barang.value
                }) // body data type must match 'Content-Typ' header
            })
                .then((resp) => resp.json())
                .then((data) => {
                    console.log(data);
                    swal("Success", "Save barang berhasil !", "success")
                        .then((value) => {
                            window.location.reload();
                        });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    } else {
        swal("Opss...", "Masukkan data barang !", "warning")
    }

})

var serializeArray = function (form) {

    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {

        var field = form.elements[i];

        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push({
                    name: field.name,
                    value: field.options[n].value
                });
            }
        }

        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push({
                name: field.name,
                value: field.value
            });
        }
    }

    return serialized;

};