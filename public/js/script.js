$(document).ready(function () {

    var form = $('#form_barang');

    $('#save_barang').click(function () {

        $.ajax({

            url: form.attr("action"),
            type: 'POST',
            data: $('form_barang input').serialize(),
            success: function (data) {
                console.log(data)
            }


        })

    })




})