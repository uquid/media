/**
 * Created by Anh on 27/06/2017.
 */

$(document).ready(function () {
    $.validator.addMethod('minStrict', function (value, el, param) {
        return value >= param;
    });

    var form = $("#direct_deposit_wl_submit");
    form.validate({
        rules: {
            amount: {
                required: true,
                number: true
            }
        }
    });
    $('#calcEstCrd').on('click', function (e) {
        var _this = this;
        $(".alert").hide();
        if (form.valid()) {
            if ("true" !== $(_this).attr('data-loading')) {
                $(_this).attr('data-loading', 'true');
                $(_this).find('span').removeClass('hidden');

                var obj = {
                    amount: $('#amount').val(),
                    code: depositCode,
                    action: 'get_estimation_credit',
                    type:form.find('input[name="type"]').val()
                };

                UQAJAX.post({
                    url: form.attr('action'),
                    data: obj,
                    reloadUserBalances: false,
                    success: function (res) {
                        $(_this).find('span').addClass('hidden');
                        $(_this).attr('data-loading', 'false');
                        if (!res.status) {
                            $("#chl-error-alert").show().html(res.message);
                        } else {
                            $('.EstCreditId').html(res.message);
                        }
                    },
                    error: function () {
                        console.warn('Status returns failure');
                    }
                });
            }
        }
    });
    $('#checkTransStatus').on('click', function (e) {
        var _this = this;
        $(".alert").hide();

        if ("true" !== $(_this).attr('data-loading')) {
            $(_this).attr('data-loading', 'true');
            $(_this).find('span').removeClass('hidden');

            var obj = {
                id: $(_this).attr('data-id'),
                action: 'check_transaction_status'
            };

            UQAJAX.post({
                url: form.attr('action'),
                data: obj,
                reloadUserBalances: true,
                success: function (res) {
                    $(_this).find('span').addClass('hidden');
                    $(_this).attr('data-loading', 'false');
                    if (!res.status) {
                        $("#chl-error-alert").show().html(res.message);
                    } else {
                        $('#transStatusInfo').html(res.message);
                    }
                },
                error: function () {
                    console.warn('Status returns failure');
                }
            });
        }
    });
    $(".submit-btn").on('click', function (e) {
        e.preventDefault();
        $(".alert").hide();
        if (form.valid()) {

            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#depositCHLBTN',
                reloadUserBalances: false,
                success: function (res) {
                    if (!res.status) {
                        $("#chl-error-alert").show().html(res.message);
                    } else {
                        showOrderInfo(
                            res.objectResponsed
                        );
                    }
                },
                error: function () {
                    console.warn('Status returns failure');
                }
            });
        }
    });

    $('#updateTxHashBTN').on('click', function(e){
        e.preventDefault();
        $(".alert").hide();
        if (form.valid()) {
            form.find('input[name="action"]').val('update_tx_hash_order');
            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#updateTxHashBTN',
                reloadUserBalances: false,
                success: function (res) {
                    if (!res.status) {
                        $("#chl-error-alert").show().html(res.message);
                    } else {
                        $("#chl-success-alert").show().html(res.message);
                    }
                },
                error: function () {
                    console.warn('Status returns failure');
                }
            });
        }
    });

    var showOrderInfo = function (params) {
        var _deposit = params.deposit;
        var _orderId = params.orderId;
        var _transStatus = params.transStatus;
        var _destTag = params.tag;

        if (_destTag) {
            _deposit += '<br/><b>Destination Tag:</b> ' + _destTag + '<br/><span style="font-size:11px;">( Don\'t forget to input destination tag. Otherwise, you may lose money. )</span>';
        }

        $('#deposit-to').find('.deposit-address').html(_deposit);
        $('.deposit-to').find('.order-id').html(_orderId);
        $('#transStatusInfo').html(_transStatus);
        $('#checkTransStatus').attr('data-id', _orderId);
        var qrText = params.qrtext;
        $('#qr-code').qrcode(
            {
                width: 100,
                height: 100,
                text: qrText
            }
        );
        $('#screen1').remove();
        $('#screen2').show();
        return;
    }
});