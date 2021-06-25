(function ($) {
    function loadCurrencyNotice(){
        var sl = $("#currency").val();
        var cur = $('#currency :selected').text();
        var amt = parseFloat( balance[$('#currency').val()] );
        $('#load_card_global_submit_final .account-balances').html( convertCurrencyToCode( $('#currency').val()) + (amt).formatMoney(2, '.', ',')  );

        var max_fee = parseFloat(setting[sl].max_fee);
        var min_fee = parseFloat(setting[sl].min_fee);
        var percent = parseFloat(setting[sl].percent);
        var min_amount = parseFloat(setting[sl].min_amount);
        var max_amount = parseFloat(setting[sl].max_amount);

        $('#load_card_global_submit_final .setting-max-fee').html( convertCurrencyToCode( $('#currency').val()) + (max_fee).formatMoney(2, '.', ',')  );
        $('#load_card_global_submit_final .setting-min-fee').html( convertCurrencyToCode( $('#currency').val()) + (min_fee).formatMoney(2, '.', ',')  );
        $('#load_card_global_submit_final .setting-percent-fee').html( (percent).formatMoney(2, '.', ',') +'%' );
        $('#load_card_global_submit_final .minimum-amount').html( convertCurrencyToCode( $('#currency').val()) + (min_amount).formatMoney(2, '.', ',')  );
        $('#load_card_global_submit_final .maximum-amount').html( convertCurrencyToCode( $('#currency').val()) + (max_amount).formatMoney(2, '.', ',')  );
    }
    function calculateFee(amt){
        var currency = $('#currency').val();

        if(currency != ''){
            var $maxFee = parseFloat( setting[currency].max_fee );
            var $minFee = parseFloat( setting[currency].min_fee );
            var $percent = parseFloat( setting[currency].percent );
            var $fee = parseFloat((($percent*amt)/100));

            if($fee <= $minFee){
                return $minFee.toFixed(2);
            }else if($fee >= $maxFee){
                return $maxFee.toFixed(2);
            }else{
                return $fee.toFixed(2);
            }
        }
        return 0;
    }

    window.loadCurrencyNotice = loadCurrencyNotice;
    window.calculateFee = calculateFee;
    window.onCheckCardItem = onCheckCardItem;

    function onCheckCardItem($this){
        var i= $($this).data('it');
        var elCard = cards[i];
        var formID = "#load_card_global_submit_final";

        $(formID + ' #currency').find('option')
            .remove()
            .end()
            .append('<option value="'+elCard.currency+'">'+elCard.currency2+'</option>')
            .val(elCard.currency);

        loadCurrencyNotice();
        $('#UQNameOnCardF001').val(elCard.nameOnCard);
        $('#UQHashVLF002').val(elCard.hash);
        $('#UQProxyCardF003').val(elCard.proxy);

        var amt = parseFloat($("#amount").val());
        if(amt > 0){
            amt += parseFloat( calculateFee(amt) );
            $(".amount-2-send").html( convertCurrencyToCode($('#currency').val()) + (amt).formatMoney(2, '.', ',')  );
        }else{
            $(".amount-2-send").html('');
        }
    }

    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();

        $('input[name="checkCard"]').first().attr('checked',true);
        onCheckCardItem($('input[name="checkCard"]').first());

        $(document).on("keyup", "#amount",function(e){
            if($.trim( $('#currency').val() ) != ''){
                var amt = parseFloat($(this).val());
                if(amt > 0){
                    amt += parseFloat( calculateFee(amt) );
                    $(".amount-2-send").html( convertCurrencyToCode($('#currency').val()) + (amt).formatMoney(2, '.', ',')  );
                }
            }
        });

        var form = $("#load_card_global_submit_final");

        form.validate();
        $( ".submitGOF" ).on('click', function(e){
            e.preventDefault();
            $('.alert').html('').hide();

            if($('input[name="checkCard"]:checked').length == 0){
                alert("Please select card.");
                return false;
            }
            if(form.valid()){
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '.submitGOF',
                    reloadUserBalances: true,
                    success: function (res) {
                        $('#captchaIMG').html(res.cr);
                        $('#captcha').val('').attr('value','');

                        if(res.status){
                            $("#success-alert").html(res.message).show();
                            window.setTimeout(function(){
                                $('.LoadCardBalanceGlobalModal0001').modal('hide');
                                //sysUpdateBalance(res);
                            }, 1500);
                        }else{
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