/**
 * Created by Anh on 27/06/2017.
 */
$(function () {
    $('#datetimepicker1').datetimepicker({
        format: 'MM/DD/YYYY'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'MM/DD/YYYY'
    });

    UQAJAX.get({
        url: "/account/async/summary",
        dataType: 'html',
        success: function (res) {
            $('.table-responsive').html(res);
        },
        error: function () {
            console.warn('Server error');
        }
    });

    $("#my-account").on('click','.pagination a', function(e){
        e.preventDefault();
        var link = $(this).attr('href');

        UQAJAX.get({
            url: link,
            dataType: 'html',
            success: function (res) {
                $('.table-responsive').html(res);
            },
            error: function () {
                console.warn('Server error');
            }
        });
    });

    $('.datetimebt').on('click',function(e){

        var currency =  $('#currency').val();
        var fromDate = $('#from_date').val();
        var toDate = $('#to_date').val();

        UQAJAX.get({
            ladda: '.datetimebt',
            url: "/account/async/summary",
            dataType: 'html',
            data: {
                currency: currency,
                fromDate: fromDate,
                toDate: toDate
            },
            success: function (res) {
                $('.table-responsive').html(res);
            },
            error: function () {
                console.warn('Server error');
            }
        });
    });
});