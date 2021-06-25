/**
 * Created by Anh on 27/06/2017.
 */
$(document).ready(function () {
    function disableBack() {
        window.history.forward()
    }

    window.onload = disableBack();
    window.onpageshow = function (evt) {
        if (evt.persisted)
            disableBack()
    }

    $('[data-toggle="tooltip"]').tooltip();
    var form = $("#payment_submit");
    form.validate();
    $('#cancelPaymentButton').on('click', function (e) {
        e.preventDefault();
        $('<input>').attr({
            type: 'hidden',
            id: 'action',
            name: 'action',
            value: 'cancelPayment'
        }).appendTo(form);
        $.each(window.csrf,function(i,o){
            $('<input>').attr(
                {
                    type: 'hidden',
                    name: i,
                    value: o
                }
            ).appendTo(form);
        });
        $('#pin').removeAttr('required');
        form.submit();
    });
    $('#returnPaymentButton').on('click', function (e) {
        e.preventDefault();
        $('<input>').attr(
            {
                type: 'hidden',
                id: 'action',
                name: 'action',
                value: 'returnPayment'
            }
        ).appendTo(form);
        $.each(window.csrf,function(i,o){
            $('<input>').attr(
                {
                    type: 'hidden',
                    name: i,
                    value: o
                }
            ).appendTo(form);
        });
        $('#pin').removeAttr('required');
        form.submit();
    });
    $('#makePaymentButton').on('click', function (e) {
        e.preventDefault();
        $('.alert').html('').hide();
        if (form.valid()) {

            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#makePaymentButton',
                reloadUserBalances: true,
                success: function (res) {
                    if (res.status) {
                        location.reload(true);
                    } else {
                        $("#error-alert").html(res.message).show();
                    }
                },
                error: function () {
                    console.warn('Status returns failure');
                }
            });
        }
    });
});