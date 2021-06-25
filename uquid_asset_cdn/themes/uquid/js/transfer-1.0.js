(function ($) {

    $('.transfer_to_partner').on('click', function (e) {
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<div>loading...</div>').load('account/transfer/transfer_to_partner'),
            title: "Transfer to partner balance"
        });
    });

    $(document).ready(function(){
        $("#amount").on("keyup",function(e){
            if($.trim( $('#currency').val() ) != ''){
                var amt = parseFloat($(this).val());
                if(amt > 0){
                    $(".amount-2-send").html( (amt).formatMoney(2, '.', ',') + ' '+ $('#currency').val().toUpperCase()  );
                }
            }
        });
        loadCurrencyNotice();
        var form = $("#transfer_submit");
        form.validate();
        $( ".submit-btn" ).on('click', function(e){
            e.preventDefault();
            $('#response-message').html('');
            if(form.valid()){
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '.submit-btn',
                    reloadUserBalances: true,
                    success: function (res) {
                        $('#response-message').html(res.res_data);
                    },
                    error: function () {
                        console.warn('Status returns failure');
                    }
                });
            }
        });
    });

    function loadCurrencyNotice(){
        var currency = $('#currency').val();
        $('.currency-usd,.currency-euro,.currency-gbp').addClass('hidden');
        $('.currency-'+currency).removeClass('hidden');
        if(currency != ''){
            $("#currency-notice").show();
            $(".setting-max-fee").html( setting[currency].code + '' + parseFloat(setting[currency].max_fee).formatMoney(2, '.', ',') );
            $(".setting-min-fee").html( setting[currency].code + '' + parseFloat(setting[currency].min_fee).formatMoney(2, '.', ',') );
            $(".setting-percent-fee").html( setting[currency].percent + '%');
            $(".minimum-amount").html(setting[currency].code + '' +parseFloat(setting[currency].min_amount).formatMoney(2, '.', ','));
            $(".maximum-amount").html(setting[currency].code + '' +parseFloat(setting[currency].max_amount).formatMoney(2, '.', ','));
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
})(jQuery);