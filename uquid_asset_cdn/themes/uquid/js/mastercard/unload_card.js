function loadCurrencyNotice(){
    var sl = $("#currency").val();
    var cur = $('#currency :selected').text();
    var text = gLangCNB;
    var fee = setting[sl] + cur;
    $('#buyCardFee').html(text.replace('%s',fee));
}
function calculateFee(amt){
    var currency = $('#currency').val();

    if(currency != ''){
        var $maxFee = parseFloat( setting[currency].max_fee );
        var $minFee = parseFloat( setting[currency].min_fee );
        var $percent = parseFloat( setting[currency].percent );
        var $feeExt = parseFloat( setting[currency].ext_fee );
        var $fee = parseFloat((($percent*amt)/100)) + parseFloat($feeExt);

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
$(document).ready(function(){
    var form = $("#submit_unload_card");
    form.validate();
    $( ".submit-btn" ).on('click', function(e){
        e.preventDefault();
        $('.alert').html('').hide();
        if(form.valid()){

            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#unloadCardBTN',
                reloadUserBalances: true,
                success: function (res) {
                    $('#captchaIMG').html(res.cr);
                    $('#captcha').val('').attr('value','');

                    if(res.status){
                        $("#success-alert").html(res.message).show();
                        window.setTimeout(function(){
                            $('.unLoadCardBalanceModal0001').modal('hide');
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
