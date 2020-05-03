$(document).ready(function () {
  select_data();
  $('#save_barang').click(function (e) {
    e.preventDefault()

    var cbarang = $('#code_barang').val();
    var nbarang = $('#nama_barang').val();
    var hbeli = $('#harga_beli').val();
    var hbarang = $('#harga_barang').val();
    var mbarang = $('#merk_barang').val();
    var sbarang = $('#stock_barang').val();
    var expire = $('#expire').val();

    $.ajax({
      method: "POST",
      url: "../server/save_barang.php",
      data: {
        "code_barang": cbarang,
        "nama_barang": nbarang,
        "harga_beli": hbeli,
        "harga_barang": hbarang,
        "merk_barang": mbarang,
        "stock_barang": sbarang,
        "expire": expire
      },
    }).done(function (data) {
      var result = $.parseJSON(data);
      console.log(result);

      var str = '';
      var cls = '';
      var string = '';
      if (result == 1) {
        cls = 'alert alert-success';
        str = 'Data berhasil di simpan';
        reset_form();

      } else if (result == 2) {
        str = 'Semua field harus di isi';
        cls = 'alert';
      } else {
        str = 'Data gagal di simpan. Coba lagi';
        cls = 'error';
      }
      $("#pesan_teks").html(str);
      $("#alert").show(500).removeClass().addClass(cls).hide(2000);


    });

  })

  // Reload data after save
  function dataReload() {
    setTimeout(function () {
      window.location.reload(1);
    }, 100);
  }



  // Reset input form
  function reset_form() {
    $('#form_barang').each(function () {
      $('#form_barang input').val(' ')
    })
  }



  // Menampilkan data dari json ke tabel
  function select_data() {

    $.ajax({
      method: "GET",
      url: "../server/select_barang.php",

    }).done(function (data) {

      var result = $.parseJSON(data);
      var string = '';

      $.each(result, function (key, value) {

        string += `<tr>
                            <td>` + value['code_barang'] + `</td>
                            <td>` + value['nama_barang'] + `</td>
                            <td>` + value['stock'] + `</td>
                            <td class="td-actions"><a href="?edit=` + value['id_barang'] + `" id="edit" class="btn btn-small btn-success"><i class="btn-icon-only icon-ok"> </i></a>
                            <a href="#" id="` + value['id_barang'] + `" class="btn btn-danger btn-small btn-delete"><i class="btn-icon-only icon-remove"> </i></a></td>
                            </tr>`;
      });

      $("#tb_body").append(string);

      var del = $('a.btn-delete');
      delete_barang(del);
    });

  }



  // function SwalDelete(productId) {

  //   swal({
  //     title: 'Apakah anda yakin ?',
  //     text: "Data akan terhapus permanen",
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!',
  //     showLoaderOnConfirm: true,

  //     preConfirm: function () {
  //       return new Promise(function (resolve) {

  //         $.ajax({
  //             url: 'delete.php',
  //             type: 'POST',
  //             data: 'delete=' + productId,
  //             dataType: 'json'
  //           })
  //           .done(function (response) {
  //             swal('Deleted!', response.message, response.status);
  //             readProducts();
  //           })
  //           .fail(function () {
  //             swal('Oops...', 'Something went wrong with ajax !', 'error');
  //           });
  //       });
  //     },
  //     allowOutsideClick: false
  //   });

  // }



  //Delete data dari tabel barang

  function delete_barang(i) {
    $(i).click(function () {

      if (confirm('Data akan di detele ?')) {

        var del_id = $(this).attr('id');
        var str = '';
        var cls = '';
        $.ajax({
          type: 'POST',
          url: '../server/delete_barang.php',
          data: 'delete_id=' + del_id,
          success: function (data) {
            if (data) {
              // Sucess
              cls = 'alert alert-info';
              str = 'Data berhasil di hapus';
            } else {
              // Error 
              cls = 'alert';
              str = 'Data gagal di hapus';

            }

            $("#message").html(str);
            $("#alert-tabel").show(500).removeClass().addClass(cls).hide(3000);
            // Refresh page setelah delete data
            setTimeout(function () {
              window.location.reload(1);
            }, 3001);

          }
        })

      } else {
        cls = 'alert';
        str = 'Data gagal di hapus';

        swal("Our First Alert", "With some body text and success icon!", "success");

        // $("#message").html(str);
        // $("#alert-tabel").show(500).removeClass().addClass(cls).hide(3000);
      }


    });


  }

  $('li').on('click', function (e) {
    $('li.active').removeClass('active');
    $(this).addClass('active');
  });






  // SYSTEM KASIR

  // Simpan ke local storage
  var dataArray = [];

  // Menambahkan data ke tabel pembelian
  $('#add_chart').click(function (e) {

    e.preventDefault()

    var cbarang = $("#cbarang").val();
    var jumlah = $("#jumlah").val();
    var pembeli = $("#id_pembeli").val();


    if (cbarang == 0) {
      alert('Masukkan code barang !')
    } else if (jumlah == 0) {
      alert('Masukkan jumlah barang !')
    } else {

      $.ajax({
        url: '../server/get_data_barang.php',
        type: 'GET',
        data: {
          "cbarang": cbarang,
          "jumlah": jumlah,
          "pembeli": pembeli,
        },
      }).done(function (data) {
        $('#tb_pembelian').find("tr:gt(0)").remove()
        setupRefresh()

        var result = $.parseJSON(data);
        var string = '';
        $.each(result, function (key, value) {
          var tot = value.harga * jumlah
          var dataObj = {
            code_barang: value.code_barang,
            nama_barang: value.nama_barang,
            harga: value.harga,
            jumlah: jumlah,
            total: tot
          }

          dataArray.push(dataObj)
          console.log(dataArray);
          localStorage.ItemPenjualan = JSON.stringify(dataArray)
          //tampilData(key, value.code_barang, value.nama_barang, value.harga, jumlah, tot)

          load()
        })

        //select_pembelian()
        $('input#cbarang').val('')
        $('input#jumlah').val(1)
        $("#jumlah").removeAttr('max')

        $('#proses').show();
        focus()

      });

    }

  })







  function load() {
    var sum = 0
    if (localStorage.ItemPenjualan) {
      dataArray = JSON.parse(localStorage.ItemPenjualan)
      for (var i = 0; i < dataArray.length; i++) {
        sum = Number(dataArray[i].total) + Number(sum);
        tampilData(i, dataArray[i].code_barang, dataArray[i].nama_barang, dataArray[i].harga, dataArray[i].jumlah, dataArray[i].total)

      }
      $('#tot_pembelian').html(sum)

    }

  }



  function setupRefresh() {
    setInterval(function () {
      location.reload(1)
    }, 10);
  }

  load()

  // Save penjualan ke local storage
  $('#cbarang').keyup(function (e) {
    e.preventDefault()


    var cbarang = $("#cbarang").val();
    var jumlah = $("#jumlah").val();
    var pembeli = $("#id_pembeli").val();


    if (event.which == 13) {

      if (cbarang == 0) {
        swal("Opss...", "Masukkan code barang !", "warning")
      } else if (jumlah == 0) {
        swal("Opss...", "Masukkan jumlah barang !", "warning")
      } else {

        console.log(dataArray.length)

        $.ajax({
          url: '../server/get_data_barang.php',
          type: 'GET',
          data: {
            "cbarang": cbarang,
            "jumlah": jumlah,
            "pembeli": pembeli,
          },
        }).done(function (data) {
          $('#tb_pembelian').find("tr:gt(0)").remove()
          //setupRefresh()

          var result = $.parseJSON(data);
          var string = '';
          $.each(result, function (key, value) {
            var tot = value.harga * jumlah
            var dataObj = {
              code_barang: value.code_barang,
              nama_barang: value.nama_barang,
              harga: value.harga,
              jumlah: jumlah,
              total: tot
            }

            dataArray.push(dataObj)
            localStorage.ItemPenjualan = JSON.stringify(dataArray)
            //tampilData(key, value.code_barang, value.nama_barang, value.harga, jumlah, tot)

            load()


          })

          //select_pembelian()
          $('input#cbarang').val('')
          $('input#jumlah').val(1)
          $("#jumlah").removeAttr('max')

          $('#proses').show();
          focus()

        });
      }

    }


  })

  // Simpan ke tabel penjualan

  $('#proses').click(function () {
    var id = $('#id_karyawan').val();
    if (localStorage.ItemPenjualan) {
      dataArray = JSON.parse(localStorage.ItemPenjualan)
      for (var i = 0; i < dataArray.length; i++) {

        $.ajax({
          type: "POST",
          url: "../server/simpan_penjualan.php",
          data: {
            "data": dataArray[i],
            "id_karyawan": id,
          },
          success: function (response) {
            swal("Good job", response, "success")
              .then((value) => {
                dataReload()
              });
            localStorage.clear()
          }
        });
      }
      //printStruk()
    } else {
      swal("Opss...", "Masukkan pembelian", "warning")

    }


  })

  // Print struk
  // function printStruk() {
  //   if (localStorage.ItemPenjualan) {
  //     dataArray = JSON.parse(localStorage.ItemPenjualan)
  //     for (var i = 0; i < dataArray.length; i++) {

  //       $.ajax({
  //         type: "POST",
  //         url: "../server/print.php",
  //         data: {
  //           "data": dataArray[i],
  //         },
  //         success: function (response) {
  //           window.open("../server/print.php")
  //           
  //         }
  //       });
  //     }
  //   }
  // }



  // Tampilkan ke tabel
  function tampilData(index, code_barang, nama_barang, harga, jumlah, total) {

    var string = `<tr id="tr">
    <td>` + code_barang + `</td>
    <td>` + nama_barang + `</td>
    <td>` + harga + `</td>
    <td id="jumlahItem" data-id="` + index + `" contenteditable="true">` + jumlah + `</td>
    <td id="row_harga">` + total + `</td>
    <td>
       <button url="./admin/print" data-id="` + index + `" class="btn btn-danger btn-small btn-delete-item"><i class="btn-icon-only icon-remove"> </i></button>
        </td>
    </tr>`

    $('#tb_pembelian').append(string)


  }


  // update jumlah barang kasir
  $(document).on('keyup', '#jumlahItem', function (e) {

    var row = $(this)
    var id = $(this).attr('data-id')

    var jumlah = row.closest('tr').find('td:eq(3)').text()

    if (e.which == 13) {
      e.preventDefault();

      dataArray = JSON.parse(localStorage.ItemPenjualan)
      dataArray[id].jumlah = jumlah
      dataArray[id].total = jumlah * dataArray[id].harga

      localStorage.setItem('ItemPenjualan', JSON.stringify(dataArray));

      dataReload()
    }


  })


  // Delete Item kasir
  $(document).on('click', '.btn-delete-item', function () {
    var id = $(this).attr('data-id')
    // dataArray[id] = JSON.parse(localStorage.ItemPenjualan)

    dataArray.splice(id, 1)
    localStorage.ItemPenjualan = JSON.stringify(dataArray)
    $(this).closest('tr').remove();
    //alert(id)
  })






  // Menampilkan data ke tabel kasir
  var code_penjualan;
  var jumlah_barang;
  var cbarang;

  function select_pembelian() {

    code_penjualan = $("#code_penjualan").val();
    jumlah_barang = $("#jumlah").val();
    cbarang = $("#cbarang").val();

    $.ajax({
      type: "GET",
      url: "../server/select_penjualan.php",
      data: {
        code_penjualan: code_penjualan,
        jumlah_barang: jumlah_barang,
        cbarang: cbarang
      },
      success: function (data) {


        console.log(data)

        $('#tb_pembelian').find("tr:gt(0)").remove();

        // var result = $.parseJSON(data);
        // var string = '';
        // $.each(result, function (key, value) {
        //   var no = key + 1;

        //   string += `<tr class="tr_id" id="` + value['id_penjualan'] + `">
        //               <input type="hidden" id="id_penjualan" value='` + value['id_penjualan'] + `'>
        //               <td data-id="` + value['id_penjualan'] + `"  style="visibility:hidden;" >` + value['id_penjualan'] + `</td>
        //               <td id="no">` + no + `</td>
        //               <td id="c_barang">` + value['code_barang'] + `</td>
        //               <td>` + value['nama_barang'] + `</td>
        //               <td id="id_harga">` + value['harga'] + `</td>
        //               <td id="j_barang" contenteditable="true">
        //               ` + value['jml_barang'] + `
        //               </td>
        //               <td id="row_harga">` + value['total'] + `</td>
        //               <td class="td-actions">
        //                 <a href="#` + value['id_penjualan'] + `" id="` + value['id_penjualan'] + `" class="btn btn-danger btn-small btn-delete"><i class="btn-icon-only icon-remove"> </i></a>
        //               </td>
        //             </tr>`;
        // });

        // $("#tb_pembelian").append(string);

        $('#div-tabel').html(data);

        update_tot()



        // Delete data from daftar pembelian
        $('a.btn-delete').click(function (e) {
          e.preventDefault()

          var tr = $('tr#' + id)
          var id = $(this).attr("href").split("#")[1];
          $('tr#' + id).remove();

          $.ajax({
            type: 'POST',
            url: '../server/delete_penjualan.php',
            data: 'id=' + id,
            success: function (data) {

              update_tot()
            }
          })

        })

        // Update data dari daftar pembelian

        $('td').mouseenter(function () {
          console.log($(this).data("id1"))
        })



        $("#j_barang").blur(function (e) {

          var nama_user = row.closest('tr').find('td:eq(2)').text()

          var id = $(this).data("id1");
          console.log(id)
          var stk = $(this).text();
          var hrg = $('#id_harga').text();
          if (stk >= 1) {

            $.ajax({
              url: "../server/update_stock.php",
              method: "POST",
              data: {
                "id": id,
                "stk": stk,
                "hrg": hrg,
              },
              dataType: "text",
              success: function (data) {
                $('#row_harga').text(data);
                update_tot();
              }
            });
          } else {
            alert('Tidak boleh 0')
          }

        })






        function update_tot() {
          // Membuat total harga dari semua pembelian 
          var sum = 0;

          $("td#row_harga").each(function () {

            var value = $(this).text();

            if (!isNaN(value) && value.length != 0) {
              sum = Number(value) + Number(sum);
            }
            console.log(sum)
            $('#tot_pembelian').html(sum)
          });


          //Memanggil fungsi total
          var tr = $('tr')
          total(tr);
        }





        // var jbarang = $('td#j_barang').text()
        // console.log(jbarang)
        // stock_update(jbarang)


        // var rh = $('td#row_harga').text()
        // var total_price = parseInt(rh + rh);
        // //console.log(total_price)

        // $(function () {
        //   console.log($('.table').sumtr({
        //     sumCells: 'td#row_harga'
        //   }));
        // })

        // var del = $('a.btn-delete');
        // delete_barang(del);



      }
    })



  }


  // Cek apabila jumlah barang masih sesuai dengan stock barang
  $("#jumlah").bind('keyup mouseup', function () {
    var j = $(this).val()
    var cbarang = $("#cbarang").val();

    $.ajax({
      type: "GET",
      url: '../server/cek_stock.php',
      data: {
        cbarang: cbarang
      },
      success: function (data) {
        if (cbarang == 0) {
          alert('Masukkan code barang !')
          $("#jumlah").val('1');
        } else if (Number(j) >= Number(data)) {
          alert('Stock barang code ' + data + ' habis !')
          $("#jumlah").val('1');
          $("#jumlah").attr("max", data);
        }
      }
    });

    $("#jumlah").removeAttr("max");
  });






  // Membuat code penjualan
  $(function () {
    $.ajax({
      url: '../server/code_penjualan.php',
      success: function (data) {
        $('#code_penjualan').val(data);
      }
    });
  })



  //Menampilkan total pembelian ke text total
  var tot = 0;

  function total(tr) {
    $(tr).each(function () {
      var value = $(this).text();
      // add only if the value is number
      if (!isNaN(value) && value.length != 0) {
        tot = Number(value) + Number(tot);
      }
      console.log(tot)
      //$('#tot_pembelian').html(tot)
    });
  }


  // Menghitung jumlah kembalian
  $(function () {
    $('#tunai').keyup(function () {
      var tot_pem = parseFloat($('#tot_pembelian').text()) || 0;
      var tunai = parseFloat($('#tunai').val()) || 0;
      $('#kembali').html(tunai - tot_pem);
    });
  });

  // Menambah input type pembeli ke kasir tabel
  var wrapper = $("#add_input");
  var add_button = $("#add_pembeli");

  $(add_button).click(function (e) {
    e.preventDefault();
    $(wrapper).append('<label class="control-label" for="jumlah">ID Pembeli<input type="text" class="span2" id="id_pembeli" name="id_pembeli"/></label>').show(2000); //add input box

    $(add_button).hide(700)
  });

  // Hide button proses sebelum ada pembelian
  $('#proses').show();

  // Menambah data ke table master penjualan
  // $('#proses').click(function () {
  //   var code_penjualan = $('#code_penjualan').val()
  //   var id_karyawan = 'K001';
  //   var total_pembelian = $('#tot_pembelian').text()

  //   $.ajax({
  //     url: '../server/save_master.php',
  //     type: 'POST',
  //     data: {
  //       "id_karyawan": id_karyawan,
  //       "code_penjualan": code_penjualan,
  //       "total_pembelian": total_pembelian,
  //     },
  //   }).done(function (data) {

  //     swal("Good job!", data, "success")
  //       .then((value) => {
  //         dataReload();
  //       });

  //   });
  //   var no = 1;
  //   var tot = Number(code_penjualan) + no;

  //   $('#code_penjualan').val(tot)

  // })

  //Autocomplete code barang untuk kasir 
  $('#cbarang').typeahead({
    source: function (query, result) {
      $.ajax({
        url: "../server/autocomplete_barang.php",
        data: 'query=' + query,
        dataType: "json",
        type: "POST",
        success: function (data) {
          result($.map(data, function (item) {
            return item;
          }));
        }
      });
    }
  });



  // Tampilkan modal untuk list barang
  $('#src').click(function () {


    $.ajax({
      method: "GET",
      url: "../server/select_barang.php",

    }).done(function (data) {

      var result = $.parseJSON(data);
      var string = `<table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Code Barang</th>
                            <th scope="col">Nama Barang</th>
                            <th scope="col">Stock</th>
                            <th scope="col"> </th>

                        </tr>
                    </thead>`;

      $.each(result, function (key, value) {
        string += `
                  <tbody id="modalListBarang">
                    <tr>
                      <td>` + value['code_barang'] + `</td>
                      <td>` + value['nama_barang'] + `</td>
                      <td>` + value['stock'] + `</td>
                      <td>
                      <a href="#` + value['code_barang'] + `" data-dismiss="modal" id="pilih" class="btn btn-small btn-success"><i class="btn-icon-only  icon-ok"> </i></a>
                      </td>
                    </tr>`;
      });
      string += `</tbody>
                  </table>`;
      $(".modal-body").append(string);

      // Menampilkan code barang yang di pilih ke input code barang
      $('div.modal-body a').click(function () {

        $('#cbarang').val($(this).attr("href").split("#")[1]);

        $('#cbarang').focus();

      });

      $('div.modal-body').find('table:gt(0)').remove();

    });

  })




  //Autocomplete code barang untuk kasir
  // $('#cbarang').keyup(function () {
  //   var src = $(this).val();
  //   if (src != '') {
  //     $.ajax({
  //       url: "../server/autocomplete_barang.php",
  //       method: "POST",
  //       data: {
  //         src: src
  //       },
  //       success: function (data) {
  //         console.log(data)
  //         $('#code_list').fadeIn();
  //         $('#code_list').html(data)
  //       }
  //     });
  //   } else {
  //     $('#code_list').fadeOut();
  //     $('#code_list').html("")
  //   }

  // });



  // $('li #list').click(function () {
  //   $('#cbarang').val($(this).text());
  //   $('#code_list').fadeOut();
  // })


  // $(function () {
  //   $("#cbarang").autocomplete({
  //     source: "../server/autocomplete_barang.php",
  //     select: function (event, ui) {
  //       event.preventDefault();
  //       console.log(ui.item.code_barang)
  //       $("#cbarang").val(ui.item.code_barang);
  //     }
  //   });
  // });


  // Menampilkan data dari json ke tabel
  select_users();

  $('#save_user').click(function () {

    var username = $('#username').val();
    var password = $('#password').val();
    var nama_user = $('#nama_user').val();
    var level = $('#level').val();
    var status = $('input[name="status"]:checked').val();

    var id_user = $('#id_user').val();

    if (id_user == 0) {

      $.ajax({
        method: "POST",
        url: "../server/save_user.php",
        data: {
          "username": username,
          "password": password,
          "nama_user": nama_user,
          "level": level,
          "status": status
        },
      }).done(function (data) {
        //var result = $.parseJSON(data);


        var str = '';
        var cls = '';
        var string = '';
        if (data == 1) {
          cls = 'alert alert-success';
          str = 'Data berhasil di simpan';
          reset_form_user()
          select_users();

        } else if (data == 2) {
          str = 'Semua field harus di isi';
          cls = 'alert';
        } else {
          str = 'Data gagal di simpan. Coba lagi';
          cls = 'alert alert-error';
        }
        $("#pesan_input_user").append(str);
        $("#alert_input_user").show(1000).removeClass().addClass(cls).hide(2000);


      });

    } else {
      $.ajax({
        method: "POST",
        url: "../server/update_user.php",
        data: {
          "username": username,
          "password": password,
          "nama_user": nama_user,
          "level": level,
          "status": status,
          "id_user": id_user
        },
      }).done(function (data) {
        //var result = $.parseJSON(data);

        var str = '';
        var cls = '';
        var string = '';
        if (data == 1) {
          cls = 'alert alert-success';
          str = 'Data berhasil di simpan';
          reset_form_user()
          select_users();

        } else if (data == 2) {
          str = 'Semua field harus di isi';
          cls = 'alert';
        } else {
          str = 'Data gagal di simpan. Coba lagi';
          cls = 'alert alert-error';
        }
        $("#pesan_input_user").append(str);
        $("#alert_input_user").show(1000).removeClass().addClass(cls).hide(2000);


      });
    }



  })

  // Reset form user
  function reset_form_user() {
    $('#username').val('');
    $('#password').val('');
    $('#nama_user').val('');
    $('#level').val('');
    $('input[name="status"]:checked').val('');
  }

  var userData = [];

  function select_users() {

    $.ajax({
      method: "GET",
      url: "../server/select_users.php",

    }).done(function (data) {

      var result = $.parseJSON(data);
      var string = '';

      $.each(result, function (key, value) {
        var passEnc = value['password'];

        string += `<tr>
                      <td>` + value['username'] + `</td>
                      <td>` + passEnc + `</td>
                      <td>` + value['nama_user'] + `</td>
                      <td>` + value['level'] + `</td>
                      <td>` + value['status'] + `</td>
                      <td class="td-actions"><button data-id="` + value['id_user'] + `" class="btn btn-small btn-success edit-user"><i class="btn-icon-only icon-ok"> </i></button>
                            <button data-id="` + value['id_user'] + `" class="btn btn-danger btn-small delete-user"><i class="btn-icon-only icon-remove"> </i></button></td>
                    </tr>`;

        userData.push(value['id_user']);

      });

      $("#tb_user").html(string);

      // var id = $('a.edit-user');
      // delete_user(id, value['username']);


    });
  }

  // Delete user
  $(document).on('click', '.edit-user', function () {
    var row = $(this)
    var id = $(this).attr('data-id')

    var username = row.closest('tr').find('td:eq(0)').text()
    var password = row.closest('tr').find('td:eq(1)').text()
    var nama_user = row.closest('tr').find('td:eq(2)').text()
    var level = row.closest('tr').find('td:eq(3)').text()
    var status = row.closest('tr').find('td:eq(4)').text()


    $('#username').val(username);
    $('#password').val(password);
    $('#nama_user').val(nama_user);
    $('#level').val(level);
    $('input:radio[name="status"][value=' + status + ']')[0].checked = true;
    $('#id_user').val(id);

    $('#save_user').text('Update')
  })

  $(document).on('click', '.delete-user', function () {
    var row = $(this)
    var id = $(this).attr('data-id')

    swal({
      title: "Anda yakin !",
      text: "Setelah delete, data tidak bisa di access !",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          $.ajax({
            type: "POST",
            url: "../server/delete_user.php",
            data: {
              "id": id
            },
            success: function (response) {
              swal("Berhasil...", "User Deleted", "success")
              select_users()
            }
          });
        } else {
          swal("Data safe !");
        }
      });




  })





});

// function deleteRowItem(index) {
//   var tabel = document.getElementById('tr')
//   tabel.remove(index + 1);
//   global.dataArray.splice(index, 1)

// }