function bindingIconClicked(){
    $(".item-deposit").on("click",function(e){
        $(".item-deposit").removeClass("active");
        $(this).addClass("active");
        var rel = $(this).attr("rel");

        $("#deposit-control").html('loading...');
        $("#deposit-control").load(depositUrl + "/" + rel, function(responseTxt, statusTxt, xhr){
            if(statusTxt == "success"){}
            if(statusTxt == "error")
                location.refresh();

        });
    });
}

$(document).ready(function() {
    var appendStr = '';
    $.getJSON("https://shapeshift.io/getcoins", function (result) {
        $.each(result, function (i, field) {
            if (field.status == "available" && ssDepositArr.indexOf(field.symbol.toLocaleUpperCase()) >= 0 ) {
                appendStr += '<div class="item-deposit shapeshift" rel="shapeshift/?type='+field.symbol+'">';
                appendStr += '<img src="'+field.image+'" width="100px" />';
                appendStr += '<p>'+field.name+'</p></div>';
            }
        });
        $('#signup .left-half').append(appendStr);
        bindingIconClicked();
    });
});

$(document).ready(function(){
    //bindingIconClicked();
    $(document).on("keyup", "#amount",function(e){
        if($.trim( $('#currency').val() ) != ''){
            var active = $(".item-deposit.active").attr("rel");
            var amt = parseFloat($(this).val());
            if(amt > 0){
                if(active == 'bank_wire' || active == 'bitpay'){
                    amt += parseFloat( calculateFee(amt) );
                }
                $(".amount-2-send").html( (amt).formatMoney(2, '.', ',') + ' '+ $('#currency').val().toUpperCase()  );
            }
        }
    });
});

function loadCurrencyNotice(){
    var currency = $('#currency').val();
    var active = $(".item-deposit.active").attr("rel");
    var arexp = active.split('/');
    active = arexp[0];
    if(currency != ''){
        $("#currency-notice").show();
        $(".setting-max-fee").html( setting[active]["currency"][currency].code + '' + parseFloat(setting[active]["currency"][currency].max_fee).formatMoney(2, '.', ',') );
        $(".setting-min-fee").html( setting[active]["currency"][currency].code + '' + parseFloat(setting[active]["currency"][currency].min_fee).formatMoney(2, '.', ',') );
        $(".setting-percent-fee").html( setting[active]["currency"][currency].percent + '%');
        $(".minimum-amount").html(setting[active]["currency"][currency].code + '' +parseFloat(setting[active]["currency"][currency].min_amount).formatMoney(2, '.', ','));
        $(".maximum-amount").html(setting[active]["currency"][currency].code + '' +parseFloat(setting[active]["currency"][currency].max_amount).formatMoney(2, '.', ','));
        $(".account-balances").html( (current[currency]) );

        var amt = parseFloat($("#amount").val());
        if(amt > 0){
            if(active == 'bank_wire' || active == 'bitpay'){
                amt += parseFloat( calculateFee(amt) );
            }
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

function calculateFee(amt){
    var currency = $('#currency').val();
    var active = $(".item-deposit.active").attr("rel");
    var arexp = active.split('/');
    active = arexp[0];

    if(currency != ''){
        var $maxFee = parseFloat( setting[active]["currency"][currency].max_fee );
        var $minFee = parseFloat( setting[active]["currency"][currency].min_fee );
        var $percent = parseFloat( setting[active]["currency"][currency].percent );
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

function loadCurrencySettings(){
    var currency = $('#currency').val();
    var active = $(".item-deposit.active").attr("rel");
    var arexp = active.split('/');
    active = arexp[0];
    if(currency != ''){
        $("#currency-setting-max-fee").html( setting[active]["currency"][currency].code + '' + parseFloat(setting[active]["currency"][currency].max_fee).formatMoney(2, '.', ',') );
        $("#currency-setting-min-fee").html( setting[active]["currency"][currency].code + '' + parseFloat(setting[active]["currency"][currency].min_fee).formatMoney(2, '.', ',') );
        $("#currency-setting-fee").html( setting[active]["currency"][currency].percent + '%');
    }else{
        $("#currency-setting-max-fee").html('');
        $("#currency-setting-min-fee").html('');
        $("#currency-setting-fee").html('');
    }
}