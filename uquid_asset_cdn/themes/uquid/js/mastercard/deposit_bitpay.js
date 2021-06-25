$(document).ready(function () {
    var form = $("#bitpay_submit");
    var OSName = "Unknown";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "macos";
    if (navigator.appVersion.indexOf("X11") != -1) OSName = "unix";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "linux";

    $(form).addClass(OSName);
    function resizeInput() {
        $(this).attr('size', $(this).val().length);
    }

    $('.selectable').on('click', function (e) {
        $(this).select();
    });

    form.validate();
    $(".submit-btn").on('click', function (e) {
        e.preventDefault();
        $(".alert").hide();
        if (form.valid()) {

            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#depositBTCBTN',
                reloadUserBalances: true,
                success: function (res) {
                    if (!res.status) {
                        $("#error-alert").show().html(res.message);
                    } else {
                        $("#depositBTCBTN").prop('disabled', true);

                        $('#btc-details').show();
                        $('.selectable.btc-paid').attr('value', res.btcPrice).val(res.btcPrice);
                        $('.selectable.btc-address').attr('value', res.btc_address).val(res.btc_address);
                        $('.transaction-status span').text(res.getStatus);
                        $('.btn-refresh-transaction-status').attr('data-invoiceid', res.getId);
                        invID = res.getId;
                        $('.selectable.btc-paid').each(resizeInput);

                        var intervalSec = parseInt(res.getExpirationTime) - parseInt(res.getCurrentTime);
                        intervalSec = parseInt(intervalSec / 1000);

                        var clock = $('.clock').FlipClock(intervalSec, {
                            clockFace: 'MinuteCounter',
                            countdown: true,
                            autoStart: false,
                            callbacks: {
                                stop: function () {
                                    var _this = $('.btn-refresh-transaction-status');
                                    var invoiceId = $(_this).attr('data-invoiceid');
                                    if (invID != invoiceId || invoiceId == '') {
                                        return false;
                                    }
                                    $(_this).text('Loading...');
                                    UQAJAX.post({
                                        url: bcTransSttUrl,
                                        data: {invoice_id: invoiceId},
                                        success: function (res) {
                                            $(_this).text('Refresh');
                                            if (res.status) {
                                                $('.transaction-status span').text(res.getStatus);
                                                $('#btc-details').html(res.message);
                                                form[0].reset();
                                                $("#depositBTCBTN").prop('disabled', false);
                                            } else {
                                            }
                                        },
                                        error: function () {
                                            console.warn('server error');
                                        }
                                    });
                                }
                            }
                        });
                        clock.start();
                        var qrText = res.bitcoinQR;
                        $('#qrcode').html('').qrcode(
                            {
                                width: 100,
                                height: 100,
                                text: qrText
                            }
                        );
                    }
                },
                error: function () {
                    console.warn('server error');
                }
            });
        }
    });

    $('.btn-refresh-transaction-status').on('click', function (e) {
        var invoiceId = $(this).attr('data-invoiceid');
        var _this = this;
        $(_this).text('Loading...');

        UQAJAX.post({
            url: bcTransSttUrl,
            data: {invoice_id: invoiceId},
            success: function (res) {
                $(_this).text('Refresh');
                if (res.status) {
                    $('.transaction-status span').text(res.getStatus);
                } else {
                    console.warn('Server error')
                }
            },
            error: function () {
                console.warn('server error');
            }
        });
    });
    $('.btn-cancel').on('click', function (e) {
        $('#deposit-control').html('');
        $('.item-deposit[rel="bitpay"]').trigger('click');
    });
    $('.btn-done').on('click', function (e) {
        var _this = $('.btn-refresh-transaction-status');
        var invoiceId = $(_this).attr('data-invoiceid');

        $(_this).text('Loading...');
        UQAJAX.post({
            url: bcTransSttUrl,
            data: {invoice_id: invoiceId},
            success: function (res) {
                $(_this).text('Refresh');
                if (res.status) {
                    if (res.getStatus == 'new' || res.getStatus == 'expired' || res.getStatus == 'invalid') {
                        alert(bcTransErrMsg);
                    } else {
                        $('#btc-details').html(bcMPMdone);
                        form[0].reset();
                        $("#depositBTCBTN").prop('disabled', false);
                    }
                }
            },
            error: function () {
                console.warn('server error');
            }
        });
    });
});