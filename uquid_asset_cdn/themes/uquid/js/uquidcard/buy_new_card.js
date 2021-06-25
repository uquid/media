(function ($) {
    function changeDeliveryAddress() {
        var toggle = parseInt($('#triggerChangeDlvAddress').val());
        toggle = Math.abs(toggle - 1);
        $('#triggerChangeDlvAddress').val(toggle);

        var cls = '';
        var hidden = '';
        if (toggle == 0) {
            cls = 'fa-angle-right';
        } else {
            cls = 'fa-angle-down';
        }
        $('#change-delivery-address .change-address .fa').removeClass('fa-angle-right').removeClass('fa-angle-down').addClass(cls);
        $('#change-delivery-address .wrapChangeAddress').toggleClass('hidden');
    }

    function loadCurrencyNotice() {
        var sl = $("#currency").val();
        var cur = $('#currency :selected').text();
        var text = gLangACC_CARD_NOTE_BUY;
        var more = gLangACC_CRE_P_NMES;
        more = more.replace('%s', gLangRestrictCnt);
        var more2 = gLangACC_CRE_V_NMES;

        if ($('#card_type').val() == 'plastic') {
            $('#changeDeliveryMethod').show();
            if ($('#delivery_type').val() == '1') {
                var f = parseFloat(setting[sl]) + parseFloat(setting_ext[sl]);
                var fee = f + cur;
            } else {
                var fee = parseFloat(setting[sl]) + cur;
            }
        } else {
            $('#changeDeliveryMethod').hide();
            var fee = setting_v[sl] + cur;
        }
        text = text.replace('%s', '<span style="background: #333;color:#fff;">' + fee + '</span>');
        $('#change-delivery-address').hide();
        $('#change-profile-address').show();
        if ($('#card_type').val() == 'plastic') {
            text += '<br/>' + more;
            $('#change-delivery-address').show();
            $('#changeProfileAddressText').html(more2);
            //changeDeliveryAddress();
        } else {
            text += '<br/>' + more2;
            $('#change-profile-address').show();
            $('#changeProfileAddressText').html('');
        }
        $('#buyCardFee').html(text);
    }

    window.changeDeliveryAddress = changeDeliveryAddress;
    window.loadCurrencyNotice = loadCurrencyNotice;

    $(document).ready(function () {
        $('#dob').datepicker({
            format: 'mm/dd/yyyy',
            endDate: '12/30/2010'
        });
        loadCurrencyNotice();
        var form = $("#submit_buy_card");
        form.validate();
        $(".submit-btn").on('click', function (e) {
            e.preventDefault();
            $('.alert').html('').hide();
            if ($('#triggerChangeDlvAddress').val() == "1") {
                $('#change-delivery-address .wrapChangeAddress input').attr("required", true);
                $('#address2,#address3').attr('required', false);
            } else {
                $('#change-delivery-address .wrapChangeAddress input').attr("required", false);
            }
            if (form.valid()) {
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#CFBuyCardBtn',
                    reloadUserBalances: true,
                    success: function (res) {
                        $('#captchaIMG').html(res.cr);
                        $('#captcha').val('').attr('value', '');
                        if (res.status) {
                            $("#success-alert").html(res.message).show();
                            window.setTimeout(function () {
                                location.reload(true);
                            }, 3500);
                        } else {
                            $("#error-alert").html(res.message).show();
                        }
                    },
                    error: function () {
                        console.warn('server error');
                    }
                });
            }
        });
    });

})(jQuery)