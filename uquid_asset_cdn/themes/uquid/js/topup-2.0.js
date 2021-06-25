(function ($) {
    //ALL SERVICES
    window.showAllChoicesForUkUSDestinationOperators = function(data){
        var operator = data.operator.split(',');
        var operatorid = data.operatorid.split(',');

        if (operator.length > 0) {
            var html = '<div class="row">';
            html += '<span class="info">';
            html += gLangSECLECTOPR + '</span>';
            html += '<div class="row options operator-option">';

            for (var i = 0; i < operator.length; i++) {
                html += '<div class="operatorWrapper">';
                html += '<input id="op_' + operatorid[i] + '" type="radio" name="select_operator" onclick="javascript: return selectOperatorTrigger(this);" data-operator-id="' + operatorid[i] + '" data-operator-name="' + operator[i] + '" data-country-id="' + data.countryid + '" data-service-id="' + 9999 + '" >';
                html += '<label for="op_' + operatorid[i] + '"><img src="https://uquid.com/uploads/logo_operator/logo-' + operatorid[i] + '-1.png" alt="' + operator[i] + '">';
                html += '<br>' + operator[i];
                html += '</label></div>';
            }

            html += '</div>';
        } else {
            var html = '<div class="row">';
            html += '<br/><br/><span class="info">';
            html += gLangNORESULT2 + '</span>';
            html += '</div>';
        }
        $('#operatorAvailList').html(html);
    }

    window.showAvailableProductsForDestination = function (data) {
        if(data.operator && data.operatorid && !data.product_list && !data.retail_price_list){
            showAllChoicesForUkUSDestinationOperators(data);
            return;
        }

        var html = '<div class="row">';
        html += '<div class="col-sm-6 text-center">';
        html += '<img src="https://uquid.com/uploads/logo_operator/logo-' + data['operatorid'] + '-1.png" alt="' + data['operator'] + '">';
        html += '<br>' + data['operator'];
        html += '</div></div><br/><br/><span class="info">';
        html += gLangSECLECTOPR + '</span>';
        html += '<div class="row options amounts">';

        var product = data['product_list'].split(',');
        var price = data['retail_price_list'].split(',');
        var gbp = convertCurrencyToCode('gbp');

        for (var i = 0; i < product.length; i++) {
            var productAmt = product[i];
            var priceAtm = price[i];

            html += '<div class="amounts2" data-product="' + productAmt + '" data-price="' + priceAtm + '">';
            html += '<a class="btn" href="javascript:;" onclick="javascript: return selectProductTrigger(' + i + ')">';
            html += parseFloat(productAmt).formatMoney(2, '.', ',') + ' ' + data['destination_currency'];
            html += '<span>' + gbp + priceAtm + '</span>'
            html += '</a></div>';
        }
        html += '</div>';
        $('#productsAvailList').html(html);
    }

    window.showAvailableServicesForDestination = function (data) {
        if (data.services.length > 0) {
            var html = '<div class="row">';
            html += '<span class="info">';
            html += gLangSELECTSERV + '</span>';
            html += '<div class="row options services-option">';

            for (var i = 0; i < data.services.length; i++) {
                html += '<div class="amounts2" data-service-id="' + data.services[i].service_id + '" data-service-name="' + data.services[i].service + '">';
                html += '<a class="btn" href="javascript:;" onclick="javascript: return selectServiceTrigger(' + data.services[i].service_id + ');">';
                html += data.services[i].service;
                html += '</a></div>';
            }
            html += '</div>';
        } else {
            var html = '<div class="row">';
            html += '<br/><br/><span class="info">';
            html += gLangNORESULT3 + '</span>';
            html += '</div>';
        }

        $('#servicesAvailList').html(html);
    }

    window.showAvailableOperators = function (data, country_id, service_id) {
        var filter = [];
        for (var i = 0; i < data.operators.length; i++) {
            if (data.operators[i].country_id == parseInt(country_id)) {
                var obj = {};
                obj = data.operators[i];
                filter.push(obj);
            }
        }

        if (filter.length > 0) {
            var html = '<div class="row">';
            html += '<span class="info">';
            html += gLangSECLECTOPR + '</span>';
            html += '<div class="row options operator-option">';

            for (var i = 0; i < filter.length; i++) {
                html += '<div class="operatorWrapper">';
                html += '<input id="op_' + filter[i].operator_id + '" type="radio" name="select_operator" onclick="javascript: return selectOperatorTrigger(this);" data-operator-id="' + filter[i].operator_id + '" data-operator-name="' + filter[i].operator + '" data-country-id="' + filter[i].country_id + '" data-service-id="' + service_id + '" >';
                html += '<label for="op_' + filter[i].operator_id + '"><img src="https://uquid.com/uploads/logo_operator/logo-' + filter[i].operator_id + '-1.png" alt="' + filter[i].operator + '">';
                html += '<br>' + filter[i].operator;
                html += '</label></div>';
            }

            html += '</div>';
        } else {
            var html = '<div class="row">';
            html += '<br/><br/><span class="info">';
            html += gLangNORESULT2 + '</span>';
            html += '</div>';
        }
        $('#operatorAvailList').html(html);
    }

    window.showAvailableProductsOfOperatorServices = function (data, country_id, service_id, operator_id) {
        if(service_id == '9999'){
            showAvailableProductsForDestination(data);
            return;
        }
        var fixed_value_payments = data.fixed_value_payments;
        var fixed_value_recharges = data.fixed_value_recharges;
        var fixed_value_vouchers = data.fixed_value_vouchers;
        var variable_value_payments = data.variable_value_payments;
        var variable_value_recharges = data.variable_value_recharges;
        var variable_value_vouchers = data.variable_value_vouchers;

        if (fixed_value_payments.length > 0 || fixed_value_recharges.length > 0 || fixed_value_vouchers.length > 0
            || variable_value_payments.length > 0 || variable_value_recharges.length > 0 || variable_value_vouchers.length > 0) {
            var html = '<div class="row">';
            html += '<span class="info">';
            html += gLangPROSERVICE + '</span>';
            html += '<div class="row options amounts">';

            var tempData = [];
            var optionSelect = '';

            /*
             if(fixed_value_payments.length > 0){
             tempData = fixed_value_payments;
             optionSelect = 'fixed_value_payments';
             }
             */
            if (fixed_value_recharges.length > 0) {
                tempData = fixed_value_recharges;
                optionSelect = 'fixed_value_recharges';
            }
            if (fixed_value_vouchers.length > 0) {
                tempData = fixed_value_vouchers;
                optionSelect = 'fixed_value_vouchers';
            }
            /*
             if(variable_value_payments.length > 0){
             tempData = variable_value_payments;
             optionSelect = 'variable_value_payments';
             }
             if(variable_value_recharges.length > 0){
             tempData = variable_value_recharges;
             optionSelect = 'variable_value_recharges';
             }
             if(variable_value_vouchers.length > 0){
             tempData = variable_value_vouchers;
             optionSelect = 'variable_value_vouchers';
             }
             */

            var gbp = convertCurrencyToCode('gbp');

            for (var i = 0; i < tempData.length; i++) {
                var productAmt = tempData[i].product_value;
                var priceAtm = tempData[i].retail_price;

                html += '<div class="amounts2" data-product-id="' + tempData[i].product_id + '" data-price="' + priceAtm + '" data-service-id="' + tempData[i].service_id + '" data-operator-id="' + tempData[i].operator_id + '" data-country-id="' + tempData[i].country_id + '" data-optionselect="' + optionSelect + '">';
                html += '<a class="btn" href="javascript:;" onclick="javascript: return selectProductTrigger_Services(this)">';
                html += parseFloat(productAmt).formatMoney(2, '.', ',') + ' ' + tempData[i].product_currency;
                html += '<span>' + tempData[i].product_name + '</span>'
                html += '<span>' + tempData[i].product_short_desc + '</span>'
                html += '<span class="prc">' + gbp + priceAtm + '</span>'
                html += '</a></div>';
            }

            if (variable_value_payments.length > 0) {
                tempData = variable_value_payments;
                optionSelect = 'variable_value_payments';

                for (var i = 0; i < tempData.length; i++) {
                    html += '<div class="amounts3" data-product-id="' + tempData[i].product_id + '" data-service-id="' + tempData[i].service_id + '" data-operator-id="' + tempData[i].operator_id + '" data-country-id="' + tempData[i].country_id + '" data-optionselect="' + optionSelect + '">';
                    html += '<a class="btn" href="javascript:;" onclick="javascript: return selectOperatorTriggerSpecial(this)">';
                    html += '<span>' + tempData[i].product_name + '</span>'
                    //html += '<span>'+tempData[i].product_short_desc+'</span>'
                    html += '</a>';
                    html += '<div class="plnAccountIDEnter" style="display:none">';
                    html += gLangENTERPLNACCID + '<br/>';
                    html += '<input type="text" maxlength="20" name="pln_account_id" class="pln_account_id" required /><br/>';
                    html += '<span style="font-style:italic">' + gLangEXM + ' 546800060938</span>';
                    html += '<br/>';
                    html += '<button id="check-pln-account-btn_' + i + '" class="ladda-button check-pln-account-btn submit-btn" onclick="checkPLNaccountID(this);" data-color="white" data-style="zoom-in" data-size="s"> <span class="ladda-label">NEXT</span> </button>';
                    html += '<div style="float:none;clear:both;width:100%;height:10px;"></div>';
                    html += '<div class="plnAvailableProductInfo" >';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                }

            }

            html += '</div>';
        } else {
            var html = '<div class="row">';
            html += '<br/><br/><span class="info">';
            html += gLangNORESULT + '</span>';
            html += '</div>';
        }

        $('#productsAvailList').html(html);
    }

    window.showAvailableProductsOfOperatorServices_PLNAccountIdSpecial = function (serverDataRes, localDataObj, nextBtnSelector) {
        var target = $('#productsAvailList .amounts3.yes').find('.plnAvailableProductInfo');
        var html = '';

        var priceAtm = serverDataRes.retail_price;
        var productAmt = serverDataRes.local_value;
        var gbp = convertCurrencyToCode('gbp');

        html += '<div class="amounts2" style="margin-left:0px;width:80%;" data-pln-account-id="' + localDataObj.plnAccountId + '" data-product-id="' + localDataObj.product_id + '" data-price="' + priceAtm + '" data-service-id="' + localDataObj.service_id + '" data-operator-id="' + localDataObj.operator_id + '" data-country-id="' + localDataObj.country_id + '" data-optionselect="' + localDataObj.data_optionselect + '">';
        html += '<a class="btn" href="javascript:;" onclick="javascript: return selectProductTrigger_Services(this)">';
        html += parseFloat(productAmt).formatMoney(2, '.', ',') + ' ' + serverDataRes.local_currency;
        html += '<span>' + serverDataRes.payment.name + '</span>';
        html += '<span>' + gLangAMT + parseFloat(serverDataRes.payment.amount) + ' ' + serverDataRes.payment.currency + '</span>';
        html += '<span>' + gLangFEE + parseFloat(serverDataRes.payment.fee) + ' ' + serverDataRes.payment.currency + '</span>';
        html += '<span class="prc">' + gbp + priceAtm + '</span>';
        html += '</a></div>';
        //console.log(target, html);
        $(target).html(html);
    }

    window.selectProductTrigger_Services = function (_this) {
        if (blockedSelect) return false;

        $('.plnAccountIDEnter').hide();
        if ($(_this).parent('.amounts2').attr('data-optionselect') == 'variable_value_payments') {
            $(_this).parents('.plnAccountIDEnter').show();
        }
        $($('#productsAvailList').find('.amounts2')).removeClass('selected');
        $($('#productsAvailList').find('.amounts3')).removeClass('selected');
        $(_this).parent().addClass('selected');
        $('#continueButton').attr('disabled', false);
        $('#continueButton').attr('data-index', -9);

        var productAmt = $(_this).clone().children().remove().end().text();
        var priceAmt = $(_this).find('span.prc').text();

        var html = '<div class="col-sm-12"><p>';
        html += gLangAMTPAID + priceAmt;
        html += '</p><p>' + gLangLOCALREVAL + productAmt;
        html += '</p></div>';
        $('#productInfoFee').html(html);
    }

    window.selectOperatorTrigger = function (_this) {
        var operator_id = $(_this).attr('data-operator-id');
        var operator_name = $(_this).attr('data-operator-name');
        var country_id = $(_this).attr('data-country-id');
        var service_id = $(_this).attr('data-service-id');

        var form = $("#transfer_submit");
        $('.plnAccountIDEnter').hide();
        $('#continueButton').attr('disabled', true);

        $('#productsAvailList').html('<span>Loading...</span>');

        var destinationNumber = $('#destination_number');
        var destinationPhone = destinationNumber.intlTelInput("getNumber");

        UQAJAX.post({
            url: form.attr('action'),
            data: {
                country_id: country_id,
                action: service_id != '9999' ?'checkAllProductsOfOperator':'checkAllProductsOfOperatorTopupForUsOrUk',
                service_id: service_id,
                operator_id: operator_id,
                destinationPhone: destinationPhone
            },
            reloadUserBalances: true,
            success: function (res) {
                if (!res.status) {
                    $('#error-alert').html(res.message).show();
                } else {
                    window.showAvailableProductsOfOperatorServices(res.data, country_id, service_id, operator_id);
                }
            },
            error: function () {
                console.warn('Server error');
            }
        });
    }

    window.selectOperatorTriggerSpecial = function (_this) {
        var target = $(_this).parent('.amounts3');
        var operator_id = $(target).attr('data-operator-id');
        var service_id = $(target).attr('data-service-id');
        var country_id = $(target).attr('data-country-id');
        var product_id = $(target).attr('data-product-id');
        var data_optionselect = $(target).attr('data-optionselect');

        $('.amounts3').removeClass('yes').removeClass('selected');
        $(target).find('.plnAvailableProductInfo').html('');
        $('.plnAccountIDEnter').hide();
        $(target).find('.plnAccountIDEnter').show();
        $($('#productsAvailList').find('.amounts2')).removeClass('selected');
        $(target).addClass('selected').addClass('yes');
        $('#continueButton').attr('disabled', true);
        $(target).find('input[name="pln_account_id"]').val('').attr('value', '');

        $(target).find('.check-pln-account-btn')
            .attr('data-operator-id', operator_id)
            .attr('data-service-id', service_id)
            .attr('data-country-id', country_id)
            .attr('data-optionselect', data_optionselect)
            .attr('data-product-id', product_id);
    }
    window.checkPLNaccountID = function (_this) {
        var target = _this;

        $(target).parents('.amounts3').find('.plnAvailableProductInfo').html('');
        $('#continueButton').attr('disabled', true);

        var obj = {};
        obj.operator_id = $(target).attr('data-operator-id');
        obj.service_id = $(target).attr('data-service-id');
        obj.country_id = $(target).attr('data-country-id');
        obj.product_id = $(target).attr('data-product-id');
        obj.data_optionselect = $(target).attr('data-optionselect');
        obj.plnAccountId = $(_this).parent('.plnAccountIDEnter').find('input[name="pln_account_id"]').val();
        obj.action = 'checkPLNAccountOfOperator';

        var form = $("#transfer_submit");

        $('.alert').hide();
        if (form.valid()) {
            var laddaSelector = $(_this).attr('id');

            UQAJAX.post({
                url: form.attr('action'),
                ladda: '#' + laddaSelector,
                data: obj,
                reloadUserBalances: true,
                success: function (res) {
                    if (!res.status) {
                        $('#error-alert').html(res.message).show();
                    } else {
                        showAvailableProductsOfOperatorServices_PLNAccountIdSpecial(res.data, obj, target);
                    }
                },
                error: function () {
                    console.warn('Server error');
                }
            });
        }
    }

//TOPUP

    window.selectProductTrigger = function (index) {
        if (blockedSelect) return false;

        $($('#productsAvailList').find('.amounts2')).removeClass('selected')
        $($('#productsAvailList').find('.amounts2')[index]).addClass('selected');
        $('#continueButton').attr('disabled', false);
        $('#continueButton').attr('data-index', index);

        var productAmt = $($('#productsAvailList').find('.amounts2')[index]).find('a').clone().children().remove().end().text();
        var priceAmt = $($('#productsAvailList').find('.amounts2')[index]).find('span').text();

        var html = '<div class="col-sm-12"><p>';
        html += gLangAMTPAID + priceAmt;
        html += '</p><p>' + gLangLOCALREVAL + productAmt;
        html += '</p></div>';
        $('#productInfoFee').html(html);
    }

    window.selectServiceTrigger = function (service_id) {
        if (blockedSelect) return false;

        $($('#servicesAvailList').find('.amounts2')).removeClass('selected')
        $($('#servicesAvailList [data-service-id="' + service_id + '"]')).addClass('selected');
        $('#continueButton').attr('disabled', true);

        var form = $("#transfer_submit");
        var destinationNumber = $('#destination_number');
        var destinationPhone = destinationNumber.intlTelInput("getNumber");

        $('#operatorAvailList').html('<span>Loading...</span>');
        $('#productsAvailList').html('');

        UQAJAX.post({
            url: form.attr('action'),
            data: {
                destinationPhone: destinationPhone,
                action: 'checkAllOperatorsOfService',
                service_id: service_id
            },
            reloadUserBalances: true,
            success: function (res) {
                if (!res.status) {
                    $('#error-alert').html(res.message).show();
                } else {
                    showAvailableOperators(res.data, res.country_id, service_id);
                }
            },
            error: function () {
                console.warn('Server error');
            }
        });
    }

    window.resetAllSelectedValue = function () {
        $('.pln_account_id').removeAttr('required');
        $($('#productsAvailList').find('.amounts2')).removeClass('selected').removeClass('blockedClick');
        $('#productsAvailList').html('');
        $('#continueButton').attr('disabled', true);
        $('#continueButton').attr('data-phone', '');
        $('#continueButton').attr('data-index', '');
        $('#productInfoFee').html('');
        $('#servicesAvailList').html('');
        $('#operatorAvailList').html('');
    }

    $(document).ready(function () {
        var destinationNumber = $('#destination_number');
        var senderNumber = $('#sender_number');
        destinationNumber.intlTelInput({
            nationalMode: false,
            geoIpLookup: function (callback) {
                $.get("//ipinfo.io", function () {
                }, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    callback(countryCode);
                });
            },
            initialCountry: "auto"
        });
        senderNumber.intlTelInput({
            nationalMode: false,
            geoIpLookup: function (callback) {
                $.get("//ipinfo.io", function () {
                }, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    callback(countryCode);
                });
            },
            initialCountry: "auto"
        });

        $.validator.methods.isPhoneCorrect = function (value, element) {
            var check = $(element).intlTelInput("isValidNumber");
            return check;
        }

        var form = $("#transfer_submit");
        form.validate({
            rules: {
                destination_number: {
                    required: true,
                    isPhoneCorrect: true
                },
                sender_number: {
                    required: true,
                    isPhoneCorrect: true
                }
            },
            messages: {
                destination_number: {
                    required: "Destination number is required",
                    isPhoneCorrect: "Your number is not correct format."
                },
                sender_number: {
                    required: "Sender number is required",
                    isPhoneCorrect: "Your number is not correct format."
                }
            }
        });

        form.on('submit', function (e) {
            e.preventDefault;
            return false;
        });

        $(".check-number-btn").on('click', function (e) {
            e.preventDefault();
            $('.pln_account_id').removeAttr('required');
            if (form.valid()) {
                window.resetAllSelectedValue();
                var destinationPhone = destinationNumber.intlTelInput("getNumber");
                var countryData = destinationNumber.intlTelInput("getSelectedCountryData");
                countryData.destinationPhone = destinationPhone;
                countryData.action = 'check';

                $('#continueButton').attr('data-phone', destinationPhone);
                $('.alert').hide();

                UQAJAX.post({
                    url: form.attr('action'),
                    ladda: '.check-number-btn',
                    data: countryData,
                    reloadUserBalances: true,
                    success: function (res) {
                        if (!res.status) {
                            $('#error-alert').html(res.message).show();
                        } else {
                            window.showAvailableProductsForDestination(res.data);
                        }
                    },
                    error: function () {
                        console.warn('Server error');
                    }
                });
            }
        });

        $(".check-services-btn").on('click', function (e) {
            e.preventDefault();
            if (form.valid()) {
                window.resetAllSelectedValue();

                var destinationPhone = destinationNumber.intlTelInput("getNumber");
                var countryData = destinationNumber.intlTelInput("getSelectedCountryData");
                countryData.destinationPhone = destinationPhone;
                countryData.action = 'checkAllServicesForDestination';

                $('#continueButton').attr('data-phone', destinationPhone);
                $('.alert').hide();

                UQAJAX.post({
                    url: form.attr('action'),
                    ladda: '.check-services-btn',
                    data: countryData,
                    reloadUserBalances: true,
                    success: function (res) {
                        if (!res.status) {
                            $('#error-alert').html(res.message).show();
                        } else {
                            window.showAvailableServicesForDestination(res.data);
                        }
                    },
                    error: function () {
                        console.warn('Server error');
                    }
                });
            }
        });


        destinationNumber.on("countrychange", function (e, countryData) {
            window.resetAllSelectedValue();
        }).on('change', function (e) {
            window.resetAllSelectedValue();
        }).on('keypress', function (e) {
            window.resetAllSelectedValue();
        });

        $(".send-topup-btn").on('click', function (e) {
            e.preventDefault();
            if (!form.valid()) {
                return false;
            }

            var post = {};
            post.destinationPhone = $('#continueButton').attr('data-phone');
            post.indexProduct = $('#continueButton').attr('data-index');
            post.sender = senderNumber.intlTelInput("getNumber");
            post.message = $('#text_message').val();
            post.action = 'send';

            if (post.indexProduct == '-9') {
                post.action = 'sendTopupServices';
                post.product_id = parseInt($('#productsAvailList').find('.amounts2.selected').attr('data-product-id'));
                post.price = parseFloat($('#productsAvailList').find('.amounts2.selected').attr('data-price'));
                post.service_id = parseInt($('#productsAvailList').find('.amounts2.selected').attr('data-service-id'));
                post.operator_id = parseInt($('#productsAvailList').find('.amounts2.selected').attr('data-operator-id'));
                post.country_id = parseInt($('#productsAvailList').find('.amounts2.selected').attr('data-country-id'));
                post.productType = $('#productsAvailList').find('.amounts2.selected').attr('data-optionselect');

                if (post.product_id <= 0 || post.price <= 0 || post.service_id <= 0 || post.operator_id <= 0 || post.country_id <= 0 || !post.productType) {
                    alert('Something went wrong!');
                    form[0].reset();
                    window.resetAllSelectedValue();
                    return false;
                }

                if (post.productType == 'variable_value_payments') {
                    post.plnAccountId = $('#productsAvailList').find('.amounts2.selected').attr('data-pln-account-id');
                    if (!post.plnAccountId) {
                        alert('Something went wrong!');
                        form[0].reset();
                        window.resetAllSelectedValue();
                        return false;
                    }
                }
            }

            $('.alert').hide();
            $(".check-number-btn").attr('disabled', true);
            $(".check-services-btn").attr('disabled', true);
            $(".check-pln-account-btn").attr('disabled', true);
            blockedSelect = true;

            UQAJAX.post({
                url: form.attr('action'),
                ladda: '.send-topup-btn',
                data: post,
                reloadUserBalances: true,
                success: function (res) {
                    $(".check-number-btn").attr('disabled', false);
                    $(".check-services-btn").attr('disabled', false);
                    $(".check-pln-account-btn").attr('disabled', false);
                    blockedSelect = false;
                    if (!res.status) {
                        $('#error-alert').html(res.message).show();
                    } else {
                        $('#success-alert').html(res.message).show();
                        form[0].reset();
                        window.resetAllSelectedValue();
                    }
                },
                error: function () {
                    console.warn('Server error');
                }
            });
        });

        $('.intl-tel-input .selected-flag').on('click', function (e) {
            var distance = $(this).offset().top - $(window).scrollTop() + 40;
            $(this).parents('.intl-tel-input').find('.country-list').css({
                'position': 'fixed', 'top': distance, 'height': 200
            });
        });
        $(window).scroll(function () {
            $('.intl-tel-input .selected-flag').each(function (e) {
                var distance = $(this).offset().top - $(window).scrollTop() + 40;
                $(this).parents('.intl-tel-input').find('.country-list').css({
                    'position': 'fixed', 'top': distance, 'height': 200
                });
            });
        });

    });
})(jQuery)