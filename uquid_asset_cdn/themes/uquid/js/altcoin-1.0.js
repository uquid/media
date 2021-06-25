jQuery(document).ready(function ($) {
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    var destination = getUrlParameter('destination');
    pre_amount = getUrlParameter('amount');
    if (destination) {
        $('#withdraw-address').val(destination);
    }
    if (pre_amount) {
        $('#amount').val(pre_amount);
    }

    $('.ssio-currency-dropdown').val('---');
    function round(value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
            return Math.round(value);

        value = +value;
        exp = +exp;

        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
            return NaN;

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    }

    var ssio_protocol = "https://";
    var spinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
    var deposit_type = '';
    var altcoin_deposit_limit = ''; // defined here (globally) because it is used in a bunch of places
    var crypto_data = {};

    function show_error(msg) {
        alert(msg);
    }

    function send_success_email(email, txid) {
        $.post(ssio_protocol + "shapeshift.io/mail", {
            email: email,
            txid: txid
        }).done(function (response) {
            //console.log("sent email", response);
            if (response.error) {
                var to_display = response.error;
            } else {
                var to_display = response.email.message;
            }
            //$('#shapeshift-lens-modal .ssio-email-status-msg').text(to_display);
        }).error(function (response) {
            if (response.error == "I'm busy right now, sorry.") {
                // iterate while busy signal until the email gets successfully sent.
                setTimeout(function () {
                    send_success_email(email, txid);
                }, 3000);
            }
        });
    }

    function getRates(rate_pair) {
        $('.ssio-limit, .ssio-exchange-rate').fadeIn();
        var altcoin_symbol = rate_pair;
        var pair = "btc_" + altcoin_symbol;

        $(".exchange-rate p").html(spinner);
        $(".deposit-limit p").html(spinner);

        $('#shapeshift-lens-modal .ssio-more-options').show();

        $.get(ssio_protocol + "shapeshift.io/rate/" + pair, function (response) {
            if (response.error) {
                show_error("ShapeShift API returned an error: " + response.error);
                return;
            }
            var rate = response.rate;
            var formatted_rate = round(rate, 2);
            $(".exchange-rate p").text("1 BTC = " + formatted_rate + " " + altcoin_symbol.toUpperCase());

            $.get(ssio_protocol + "shapeshift.io/limit/" + pair, function (response) {
                if (response.error) {
                    show_error(response.error);
                    return;
                }
                var btc_deposit_limit = response.limit;
                altcoin_deposit_limit = (btc_deposit_limit * rate).toFixed(4);

                $(".deposit-limit p").text(altcoin_deposit_limit + " " + altcoin_symbol.toUpperCase());

            });

        });
    }

    function loadRateChange(coin) {
        $('#shapeshift-lens-modal .pay-with').fadeOut();
        if (coin !== '---' && coin !== 'btc') {
            $('.coin-container .coin').html('<img src="'+crypto_data[coin.toUpperCase()].imgUrl+'" width="100px"/>')
            $('.deposit-limit, .exchange-rate, .return-address-input, .email-input').fadeIn();
            getRates(coin);
        }
        if (coin == 'btc') {
            $('.deposit-limit, .exchange-rate, .return-address-input, .email-input').fadeOut();
        }
        if(coin == '---'){
            $('.coin-container .coin').html('');
        }
    }

    function show_success(msg) {
        //$('.status-message p').html(msg);
    }

    function btc_pay() {
        var deposit = $('#withdraw-address').val();
        amount = $('#amount').val();
        currency = $(".ssio-currency-dropdown").val();
        altcoin_name = crypto_data[currency.toUpperCase()].name;
        bitcoin_icon = crypto_data["BTC"].icon;
        qrstring = altcoin_name.toLowerCase() + ":" + deposit;

        var first_inst = "";

        if (amount) {
            qrstring = altcoin_name.toLowerCase() + ":" + deposit + "?amount=" + amount;
            first_inst = "Send " + amount + " " + bitcoin_icon + " BTC to <br>" + "<span class='depo-address'>" + deposit + "</span>";
        } else {
            first_inst = "Send " + bitcoin_icon + " BTC to <br>" + "<span class='depo-address'>" + deposit + "</span>";
        }
        $(".instructions").find('.first').html(first_inst);

        $('.input-form').fadeOut('normal', function () {
            $(this).remove();
            $('.instructions').fadeIn();
        });

        new QRCode(document.getElementById("qr-code"), qrstring);

        $('.coin').fadeOut('normal', function () {
            $(this).hide();
            $('#qr-code').fadeIn();
        });
    }

    function pay_button_clicked(event) {
        var btc_address = destination;
        var return_address = $('#return-address').val();
        var currency = $(".ssio-currency-dropdown").val();
        var altcoin_name = crypto_data[currency.toUpperCase()].name;
        var altcoin_icon = crypto_data[currency.toUpperCase()].icon;
        var bitcoin_icon = crypto_data["BTC"].icon;
        var email = $("#email").val();
        var pair = currency + "_btc";
        var btc_amount = $("#amount").val();

        if (btc_amount) {
            url = "shapeshift.io/sendamount";
            data = {withdrawal: btc_address, pair: pair, amount: btc_amount, returnAddress: return_address, hash: hash};
        } else {
            data = {withdrawal: btc_address, pair: pair, hash: hash};
            url = "shapeshift.io/shift";
        }

        var post2 = baseUrl + '/account/deposit/shapeshift_query';
        //ssio_protocol + url
        
        UQAJAX.post({
            url: post2,
            data: data,
            reloadUserBalances: true,
            success: function (response) {
                if (response.error) {
                    show_error(response.error);
                    return;
                }
                //console.log(response);
                var amount = null;
                var expiration = null;
                var seconds_remaining = 10 * 60;
                $(".timer")
                    .countdown(Date.now() + seconds_remaining * 1000, function(event) {
                        seconds_remaining--;
                        $(this).text(
                            event.strftime('%M min %S sec') + ' until expiration'
                        );
                        if (event.elapsed){
                            $(this).text('Your payment is still accepted.');
                        }
                    });
                if (response.success) {
                    // response came from call to 'sendamount'
                    var deposit = '';
                    var paymentId = '';
                    if(response.success.pair == 'xmr_btc'){
                        deposit = response.success.sAddress;
                        paymentId = response.success.deposit;
                    }else{
                        deposit = response.success.deposit;
                    }

                    if(response.success.pair == 'xrp_btc'){
                        var spl = deposit.split('?dt=');
                        deposit = spl[0];
                        paymentId = spl[1];
                    }

                    var amount = response.success.depositAmount;
                    expiration = response.success.expiration;
                } else {
                    // response came from call to 'shift'
                    var deposit = response.deposit;
                }
                var deposit_type = response.depositType;
                if (amount) {
                    var show_amount = "<b>" + amount + "</b> ";
                } else {
                    var show_amount = "up to <b>" + altcoin_deposit_limit + "</b>";
                }
                var first_inst = "Send " + show_amount + " " + altcoin_icon + " " + altcoin_name + " to <br>" + "<span class='depo-address'>" + deposit + "</span>";
                if(paymentId){
                    first_inst += "<br><br> Destination tag:<br>"+"<span class='depo-address'>"+paymentId+"</span>";
                    first_inst += "<br><span style='font-size:11px;'>( Don't forget to input destination tag. Otherwise, you may lose money. )</span>";
                }
                if (amount) {
                    var second_inst = "It will be converted into " + btc_amount + ' ' + bitcoin_icon + " Bitcoin, and sent to<br>" + "<span class='depo-address'>" + btc_address + "</span>";
                } else {
                    var second_inst = "It will be converted into " + bitcoin_icon + " Bitcoin, and sent to<br>" + "<span class='depo-address'>" + btc_address + "</span>";
                }

                $("#instructions-msg").html(first_inst);

                var qrstring = deposit;
                if (amount) {
                    qrstring = altcoin_name.toLowerCase() + ":" + deposit + "?amount=" + amount;
                }
                new QRCode(document.getElementById("qr-code"), qrstring);
                $('.input-form').fadeOut('normal', function () {
                    $(this).remove();
                    $('.instructions').fadeIn();
                });
                $('.coin').fadeOut('normal', function () {
                    $(this).hide();
                    $('#qr-code').fadeIn();
                });
                var ticks = 0;
                interval_id = setInterval(function () {
                    // console.log(seconds_remaining);
                    if (ticks % 8 == 0) {
                        // every eight seconds get the current status of any deposits.
                        // by making a call to shapeshift's api
                        $.get(ssio_protocol + "shapeshift.io/txStat/" + deposit, {timeout: 4500}).done(function (response) {
                            var status = response.status;

                            if (status == 'no_deposits') {
                                $('#steps #deposit').addClass('active');
                            } else if (status == 'received') {
                                //show_status("Status: Payment Received, waiting for confirmation. " + spinner);
                                $('#steps #deposit').removeClass('pending').addClass('good');
                                $('#exchange').addClass('active');
                                expiration = null;
                            } else if (status == 'complete') {
                                // console.log(response);
                                var in_type = response.incomingType;
                                var incoming = response.incomingCoin;
                                var outgoing = response.outgoingCoin;
                                var withdraw = response.withdraw;
                                var txid = response.transaction;
                                $('#exchange').removeClass('pending').addClass('good');
                                $('#complete').removeClass('pending').addClass('good');
                                $('.status-window').addClass('complete');
                                //show_success("<p>" + incoming + " " + altcoin_icon + " " + in_type + " was converted to " + outgoing + " " + bitcoin_icon + " BTC and sent to " + "<strong>" + withdraw + "</strong></p>");
                                if (email) {
                                    send_success_email(email, txid);
                                }
                                clearInterval(interval_id);
                                expiration = null;
                                //$.get(baseUrl + '/account/deposit/shapeshift_update_status', {address: deposit}, function (res) {
                                //    if(res == '1'){
                                //        parent.location.reload();
                                //    }
                                //});
                                return;
                            } else if (status == 'failed') {
                                show_error("ShapeShift.io API returned an error: " + response.error);
                                clearInterval(interval_id); //halt ticking process
                                return;
                            }
                        });
                    }
                    // $.get(ssio_protocol + "shapeshift.io/timeremaining/" + deposit, {timeout: 5 * 1000}).done(function (response) {
                    //     seconds_remaining = response.seconds_remaining;
                    // });
                    if (seconds_remaining || expiration) {
                        var seconds = seconds_remaining ? seconds_remaining : ((expiration - new Date()) / 1000).toFixed(0);
                        var timeText = ""
                        var sec = 0;
                        if (seconds > 59) {
                            var min = Math.floor(seconds / 60);
                            sec = seconds - (min * 60);
                            if (sec < 10) {
                                sec = "0" + sec;
                            }
                            timeText = min + ":" + sec;
                        }
                        else {
                            if (seconds < 10) {
                                sec = "0" + seconds;
                            }
                            timeText = "0:" + sec;
                        }
                        if (seconds > 0) {
                            // $(".timer").text(timeText + " until expiration");
                        } else {
                            // show_error("Time Expired! Please try again.");
                            clearInterval(interval_id);
                            return;
                        }
                    } else {
                        $(".timer").text('');
                    }
                    ticks++;
                }, 1000);
            },
            error: function (response) {
                if (response.error) {
                    show_error(response.error);
                    return;
                }
            }
        });
    }
    $(".ssio-currency-dropdown").msDropDown();

    $('.form-submit').click(function () {
        if ($('.ssio-currency-dropdown').val() !== '---' && $('.ssio-currency-dropdown').val() !== 'btc') {
            var return_address = $('#return-address').val();
            if($.trim(return_address).length == 0){
                alert('Return Address is required.');
                return false;
            }

            var re_coin = $('.ssio-currency-dropdown').val();
            if ($('#amount').val().length == 0) {
                window.setInterval(function () {
                    getRates(re_coin);
                }, 30000);
            }
            pay_button_clicked();
            /*$('.status-window').animate({
             /!*height: '154px'*!/
             }, 500, 'easeInOutExpo');*/
            $('.status-window').show();
        }
        if ($('.ssio-currency-dropdown').val() == 'btc') {
            btc_pay();
        }
    });

    $.getJSON("https://shapeshift.io/getcoins", function (result) {

        $.each(result, function (i, field) {
            if(specificType != ''){
                if (field.status == "available" && (specificType == field.symbol.toUpperCase() || field.symbol.toUpperCase() == 'BTC')) {
                    crypto_data[field.symbol] = {
                        "symbol": field.symbol,
                        "name": field.name,
                        "icon": "<img src='" + field.image + "' />",
                        "imgUrl": field.image
                    };
                }
            }else{
                if(field.status == "available"){
                    crypto_data[field.symbol] = {
                        "symbol": field.symbol,
                        "name": field.name,
                        "icon": "<img src='" + field.image + "' />",
                        "imgUrl": field.image
                    };
                }
            }
        });
        var msDD = $(".ssio-currency-dropdown").msDropDown().data('dd');
        $.each(crypto_data, function (key, value) {
            if (key != 'BTC') {
                msDD.add({text: value.name, value: key.toLowerCase(), image: value.imgUrl});
            }
        });
        msDD.on("change", function (res) {
            var sl = $(res.target).val();
            loadRateChange(sl);
        });

        if(specificType != ''){
            msDD.set('selectedIndex',1);
            loadRateChange(specificType.toLowerCase());
        }
    });
});

