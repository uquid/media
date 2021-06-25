/**
 * Created by Anh on 27/06/2017.
 */
function calculateFee(amt){
    var $rate = parseFloat(setting.rate);
    var $percent = parseFloat( setting.fee );
    var $fee = parseFloat((($percent*amt*$rate)/100));
    return $fee.toFixed(5);
}
function calculateBalance(amt){
    var $rate = parseFloat(setting.rate);
    var $percent = parseFloat( setting.fee );
    var $balance = parseFloat(amt*$rate);
    return $balance.toFixed(5);
}
$(document).ready(function(){
    $(document).on("keyup", "#amount",function(e){
        if($.trim( $('#currency').val() ) != ''){
            var amt = parseFloat($(this).val());
            if(amt > 0){
                var exchangeBalance = parseFloat( calculateBalance(amt) );
                var fee = parseFloat( calculateFee(amt) );
                var balanceReturn = parseFloat(exchangeBalance - fee) ;

                $(".amount-2-exchange").html( convertCurrencyToCode(setting.toCode) + (exchangeBalance).formatMoney(2, '.', ',')  );
                $(".amount-fee").html( convertCurrencyToCode(setting.toCode) + (fee).formatMoney(2, '.', ',')  );
                $(".amount-2-balance").html( convertCurrencyToCode(setting.toCode) + (balanceReturn).formatMoney(2, '.', ',')  );
            }
        }
    });

    var form = $("#submit_exchange_currency");

    form.validate();
    $( ".submit-btn" ).on('click', function(e){
        e.preventDefault();
        $('.alert').html('').hide();

        if(form.valid()){

            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#exchangeCurrencyBTN',
                reloadUserBalances: true,
                success: function (res) {
                    if(res.status){
                        $("#success-alert").html(res.message).show();
                        window.setTimeout(function(){
                            $('.exchangeModal0001').modal('hide');
                        }, 1500);
                    }else{
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