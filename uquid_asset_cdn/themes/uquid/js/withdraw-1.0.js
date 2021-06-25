(function ($) {
    function withdrawOption(){
        var opt = $('#withdrawOption').val();
        $('.withdrawOption_banking,.withdrawOption_btc').addClass('hide');
        $('.withdrawOption_'+opt).removeClass('hide');
        if(opt == 'btc'){
            $('#notes').attr('placeholder','Your BTC wallet address');
        }
    }

    $(document).ready(function(){
        withdrawOption();
        $('#withdrawOption').on('change',function (e) {
            withdrawOption();
        });

        $("#amount").on("keyup",function(e){
            if($.trim( $('#currency').val() ) != ''){
                var amt = parseFloat($(this).val());
                if(amt > 0){
                    amt += parseFloat(calculateFee(amt));
                    $(".amount-2-send").html( (amt).formatMoney(2, '.', ',') + ' '+ $('#currency').val().toUpperCase()  );
                }
            }
        });
        loadCurrencyNotice();
        var form = $("#withdraw_submit");

        form.validate();
        $( ".submit-btn" ).on('click', function(e){
            e.preventDefault();
            $('#response-message').html('');
            if(form.valid()){
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#WithdrawBTN',
                    reloadUserBalances: true,
                    success: function (res) {
                        $('#response-message').html(res.res_data).show();
                    },
                    error: function () {
                        console.warn('Status returns failure');
                    }
                });
            }
        });

    });

    function calculateFee(amt){
        var currency = $('#currency').val();

        if(currency != ''){
            var $maxFee = parseFloat( setting[currency].max_fee );
            var $minFee = parseFloat( setting[currency].min_fee );
            var $percent = parseFloat( setting[currency].percent );

            var $fee = parseFloat((($percent*amt)/100));

            //console.log("max fee:"+$maxFee + "- min fee:"+ $minFee +"- fee:"+$fee);
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

    function loadCurrencyNotice(){
        var currency = $('#currency').val();
        $('.currency-usd,.currency-euro,.currency-gbp').addClass('hidden');
        $('.currency-'+currency).removeClass('hidden');

        if(currency != ''){
            $("#currency-notice").show();
            $(".setting-max-fee").html( setting[currency].code + '' + parseFloat(setting[currency].max_fee).formatMoney(2, '.', ',') );
            $(".setting-min-fee").html( setting[currency].code + '' + parseFloat(setting[currency].min_fee).formatMoney(2, '.', ',') );
            $(".setting-percent-fee").html( setting[currency].percent + '%');
            $(".minimum-amount").html(setting[currency].code + '' + parseFloat(setting[currency].min_amount).formatMoney(2, '.', ','));
            $(".maximum-amount").html(setting[currency].code + '' + parseFloat(setting[currency].max_amount).formatMoney(2, '.', ','));
            $(".account-balances").html( (current[currency]) );

            var amt = parseFloat($("#amount").val());
            if(amt > 0){
                $(".amount-2-send").html( (amt).formatMoney(2, '.', ',') + ' '+ currency.toUpperCase()  );
            }
        }else{
            $("#currency-notice").hide();
            $(".minimum-amount").html('');
            $(".maximum-amount").html('');
            $(".account-balances").html('');
            $(".amount-2-send").html('');
        }
    }
    window.loadCurrencyNotice = loadCurrencyNotice;
    window.calculateFee = calculateFee;
})(jQuery)