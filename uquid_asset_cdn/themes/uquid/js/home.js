$(function () {
    var destinationNumber = $('#destination_number');
    var coin = $('#coin');
    var service = $('#service');
    var form = $("#homeTopupForm");

    destinationNumber.intlTelInput({
        nationalMode: false,
        geoIpLookup: function (callback) {
            destinationNumber.prop('readonly', true);
            UQAJAX.post({
                url: '/account/topup_landing/topup_submit',
                data: {
                    action: 'getIPCountry'
                },
                dataType: 'json',
                success: function (resp) {
                    if (resp && resp.status) {
                        var countryCode = (resp && resp.data.countrycode) ? resp.data.countrycode : "ID";
                        callback(countryCode);
                        UQCALLBACK(resp.token, function () {
                            setTimeout(getCoins, 100);
                        });
                    }
                    destinationNumber.prop('readonly', false);
                }
            });
        },
        initialCountry: "auto"
    });

    $.validator.methods.isPhoneCorrect = function (value, element) {
        var check = $(element).intlTelInput("isValidNumber");
        return check;
    }

    form.validate({
        rules: {
            destination_number: {
                required: true,
                isPhoneCorrect: true
            }
        },
        errorPlacement: function (error, element) {
            //Custom position: first name
            if (element.attr("name") == "destination_number") {
                $("#destination_error").html('').append(error);
            }
        },
        messages: {
            destination_number: {
                required: "Destination number is required",
                isPhoneCorrect: "Your number is not correct format."
            }
        }
    });

    $(form).on('submit', function (e) {
        e.preventDefault;
    });

    $.fn.selectpicker.Constructor.BootstrapVersion = '4';

    coin.on('change', function () {
        clearLoadedData()
        validateAndGetServices(destinationNumber, coin)
    });
    service.on('change', function () {
        clearLoadedData()
    });
    destinationNumber.on('change', function () {
        clearLoadedData()
        validateAndGetServices(destinationNumber, coin)
    });

    initTopupForm();
    initHomeForm();
    initLevel3Click();
});

function initLevel3Click() {
    $(document).on('click', '#productsAvailList .white-shdw-button', function () {
        $(this).addClass('active');
        var p = $(this).parent();
        var productId = p.attr('data-product-id');
        var price = p.attr('data-price');
        var serviceId = p.attr('data-service-id');
        var operatorId = p.attr('data-operator-id');
        var countryId = p.attr('data-country-id');
        var product = p.attr('data-product');
        var optionselect = p.attr('data-optionselect');
        var phoneNumber = $('#destination_number').intlTelInput('getNumber');

        UQAJAX.post({
            url: '/account/topup_landing/topup_submit',
            data: {
                action: 'topup-landing-submit',
                uqtopup_coin: $('#coin').val(),
                uqtopup_destination_number: phoneNumber,
                uqtopup_productId: productId,
                uqtopup_serviceId: serviceId,
                uqtopup_operatorId: operatorId,
                uqtopup_countryId: countryId,
                uqtopup_topuptype: $('#service').val(),
                uqtopup_topupproduct: product,
                uqtopup_optionselect: optionselect
            },
            dataType: 'json',
            success: function (resp) {
                if (resp && resp.status && resp.redirect_url) {
                    window.location.href = resp.redirect_url;
                } else {
                    reload();
                }
            }
        });

        /* $.cookie('uqtopup_coin', $('#coin').val(), { path: '/' });
         $.cookie('uqtopup_destination_number', phoneNumber, { path: '/' });
         $.cookie('uqtopup_productId', productId, { path: '/' });
         $.cookie('uqtopup_serviceId', serviceId, { path: '/' });
         $.cookie('uqtopup_operatorId', operatorId, { path: '/' });
         $.cookie('uqtopup_countryId', countryId, { path: '/' });
         $.cookie('uqtopup_optionselect', optionselect, { path: '/' });

         setTimeout(function () {
             window.location.pathname = '/account/topup/deposit';
         }, 1000)*/
    })
}

function initTopupForm() {
    var destinationNumber = $('#destination_number');
    var coin = $('#coin');
    var service = $('#service');
    var form = $("#homeTopupForm");
    form.submit(function (e) {
        e.preventDefault();
        if (form.valid()) {
            form.find('#btnGo i').attr('class', 'fa fa-spinner fa-spin');

            if (service.val() == "topup") {
                var countryData = destinationNumber.intlTelInput("getSelectedCountryData");
                countryData.destinationPhone = destinationNumber.intlTelInput('getNumber');
                countryData.action = 'check';
                countryData.coin = coin.val();
                UQAJAX.post({
                    url: "/account/topup_landing/topup_submit",
                    data: countryData,
                    reloadUserBalances: false,
                    success: function (res) {
                        if (!res.status) {
                            $('#error-alert').html(res.message).show();
                            setTimeout(function () {
                                $('#error-alert').fadeOut()
                            }, 2000);
                        } else {
                            window.showAvailableProductsForDestination(res.data);
                        }
                        form.find('#btnGo i').attr('class', 'fa fa-search');
                    },
                    error: function () {
                        console.warn('Server error');
                        form.find('#btnGo i').attr('class', 'fa fa-search');
                    }
                });
            } else {
                UQAJAX.post({
                    url: '/account/topup_landing/topup_submit',
                    data: {
                        action: 'checkAllOperatorsOfService',
                        destinationPhone: destinationNumber.intlTelInput('getNumber'),
                        coin: coin.val(),
                        service_id: service.val()
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp && resp.status) {
                            var country_id = resp.country_id;
                            showAvailableOperators(resp.data, country_id, service.val())
                        }
                        form.find('#btnGo i').attr('class', 'fa fa-search');
                    },
                    error: function () {
                        console.warn('Server error');
                        form.find('#btnGo i').attr('class', 'fa fa-search');
                    }
                });
            }

        } else {
            return false;
        }
    })
}

function clearLoadedData() {
    $('#productsAvailList').html('').hide();
    $('#operatorAvailList').html('').hide();
}

function validateAndGetServices(destinationNumber, coin) {
    var valid = $("#homeTopupForm").validate().element('#destination_number');
    if (valid) {
        getServices(destinationNumber, coin)
    }
}

function getCoins() {
    var coinDom = $('#coin');
    coinDom.html('');
    coinDom.closest('.main-search-input-item').find('.loading').removeClass('d-none');
    UQAJAX.post({
        url: '/account/topup_landing/topup_submit',
        data: {
            action: 'getActiveCoins'
        },
        dataType: 'json',
        success: function (resp) {
            if (resp && resp.status) {
                for (var key in resp.data) {
                    var opt = $('<option>');
                    opt.attr('value', key.toLowerCase());
                    var html = "<div><img width='20' class='coinImg' src='/uploads/logos/coins/" + resp.data[key].coin_id + ".png'> <span class='coinItem'>" + resp.data[key].coin_name + "</span></div>";
                    opt.attr('data-content', html);
                    opt.text(key);
                    coinDom.append(opt);
                }
                coinDom.selectpicker({});
            }
            coinDom.closest('.main-search-input-item').find('.loading').addClass('d-none');
        },
        error: function () {
            coinDom.closest('.main-search-input-item').find('.loading').removeClass('d-none');
        }
    });
}

//INDO number phone: 62 82111385566
function getServices(destinationNumber, coin) {
    var service = $('#service');
    var coinVal = coin.val();

    var destinationPhone = destinationNumber.intlTelInput("getNumber");
    var countryData = destinationNumber.intlTelInput("getSelectedCountryData");
    countryData.destinationPhone = destinationPhone;
    countryData.action = 'checkAllServicesForDestination';
    countryData.coin = coinVal;

    service.closest('.main-search-input-item').find('.loading').removeClass('d-none');
    try {
        service.selectpicker('destroy')
    } catch (e) {

    }
    service.html('');


    UQAJAX.post({
        url: '/account/topup_landing/topup_submit',
        data: countryData,
        dataType: 'json',
        success: function (resp) {
            if (resp && resp.status && resp.data && resp.data.services) {
                for (var i in resp.data.services) {
                    var opt = $('<option>');
                    var item = resp.data.services[i];
                    opt.text(item.service.capitalize());
                    opt.attr('value', item.service_id);
                    service.append(opt);
                }

                var opt1 = $('<option>');
                opt1.text("Topup");
                opt1.attr('value', "topup");
                service.prepend(opt1);

                service.selectpicker();
            }
            service.closest('.main-search-input-item').find('.loading').addClass('d-none');
        },
        error: function () {
            service.closest('.main-search-input-item').find('.loading').addClass('d-none');
        }
    });
}

function initHomeForm() {
    var newsletterForm = $('#newsletterForm');
    newsletterForm.submit(function (e) {
        e.preventDefault();
        newsletterForm.find('button i').attr('class', 'fa fa-spinner fa-spin');
        newsletterForm.find('.alert').addClass('d-none');
        UQAJAX.post({
            url: '/account/topup_landing/send-newsletter-subscription',
            data: newsletterForm.serialize(),
            success: function (resp) {
                if (resp.status) {
                    newsletterForm.find('.alert-success').removeClass('d-none');
                    newsletterForm.find('input[name=email]').prop('readonly', true);
                    newsletterForm.find('button').prop('disabled', true);
                } else {
                    newsletterForm.find('.alert-danger').removeClass('d-none');
                }
                newsletterForm.find('button i').attr('class', 'flaticon-next');
            },
            error: function () {
                newsletterForm.find('.alert-danger').removeClass('d-none');
                newsletterForm.find('button i').attr('class', 'flaticon-next');
            }
        })
    })
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

window.showAvailableOperators = function (data, country_id, service_id) {
    $('#productsAvailList').html('').hide();
    $('#operatorAvailList').html('');
    var filter = [];
    for (var i = 0; i < data.operators.length; i++) {
        if (data.operators[i].country_id == parseInt(country_id)) {
            var obj = {};
            obj = data.operators[i];
            filter.push(obj);
        }
    }
    var html = '';
    window.gLangSECLECTOPR = 'Select operator';
    window.gLangPROSERVICE = 'Select product';
    window.gLangNORESULT2 = 'No result';
    if (filter.length > 0) {
        html = '<div class="row"><div class="col-sm-12"><h5 class="info">' + gLangSECLECTOPR + '</h5><hr></div></div>';
        html += '<div class="row options operator-option">';

        for (var i = 0; i < filter.length; i++) {
            html += '<div class="col-sm-3">';
            html += '<div class="operatorWrapper">';
            html += '<input id="op_' + filter[i].operator_id + '" type="radio" class="icheck" name="select_operator" onclick="javascript: return selectOperatorTrigger(this);" data-operator-id="' + filter[i].operator_id + '" data-operator-name="' + filter[i].operator + '" data-country-id="' + filter[i].country_id + '" data-service-id="' + service_id + '" >';
            html += '<label for="op_' + filter[i].operator_id + '"><img height="40" src="uploads/logo_operator/logo-' + filter[i].operator_id + '-1.png" alt="' + filter[i].operator + '">';
            html += '<br> ' + filter[i].operator;
            html += '</label></div>';
            html += '</div>';
        }

        html += '</div>';
    } else {
        html = '<div class="row"><div class="col-sm-12"><h5 class="info">' + gLangPROSERVICE + '</h5><hr></div></div>';
        html += '<div></div><br/><br/><span class="info">';
        html += gLangNORESULT2 + '</span>';
        html += '</div>';
    }
    $('#operatorAvailList').html(html).slideDown();
    // $('#operatorAvailList').find('input.icheck').icheck({  });
}

window.selectOperatorTrigger = function (_this) {
    var operator_id = $(_this).attr('data-operator-id');
    var operator_name = $(_this).attr('data-operator-name');
    var country_id = $(_this).attr('data-country-id');
    var service_id = $(_this).attr('data-service-id');

    $('#productsAvailList').show().html('<span>Loading...</span>');

    UQAJAX.post({
        url: '/account/topup_landing/topup_submit',
        data: {
            country_id: country_id,
            action: service_id != '9999' ?'checkAllProductsOfOperator':'checkAllProductsOfOperatorTopupForUsOrUk',
            service_id: service_id,
            operator_id: operator_id,
            coin: $('#coin').val()
        },
        reloadUserBalances: false,
        success: function (res) {
            if (!res.status) {
                $('#error-alert').html(res.message).show();
                setTimeout(function () {
                    $('#error-alert').fadeOut()
                }, 2000);
            } else {
                window.showAvailableProductsOfOperatorServices(res.data, country_id, service_id, operator_id);
            }
        },
        error: function () {
            console.warn('Server error');
        }
    });
}

window.showAvailableProductsOfOperatorServices = function (data, country_id, service_id, operator_id) {
    if(service_id == '9999'){
        showAvailableProductsForDestination(data, country_id, service_id, operator_id);
        return;
    }

    var fixed_value_payments = data.fixed_value_payments;
    var fixed_value_recharges = data.fixed_value_recharges;
    var fixed_value_vouchers = data.fixed_value_vouchers;
    var variable_value_payments = data.variable_value_payments;
    var variable_value_recharges = data.variable_value_recharges;
    var variable_value_vouchers = data.variable_value_vouchers;

    window.gLangPROSERVICE = 'Select one product to go:';
    window.gLangENTERPLNACCID = 'Enter account id';
    window.gLangNORESULT = 'No result';
    window.gLangEXM = 'For example';

    var html = '';
    if (fixed_value_payments.length > 0 || fixed_value_recharges.length > 0 || fixed_value_vouchers.length > 0
        || variable_value_payments.length > 0 || variable_value_recharges.length > 0 || variable_value_vouchers.length > 0) {
        html = '<div class="row"><div class="col-sm-12"><h5 class="info">' + gLangPROSERVICE + '</h5><hr></div></div>';
        html += '<div class="row options amounts">';

        var tempData = [];
        var optionSelect = '';

        if (fixed_value_recharges.length > 0) {
            tempData = fixed_value_recharges;
            optionSelect = 'fixed_value_recharges';
        }
        if (fixed_value_vouchers.length > 0) {
            tempData = fixed_value_vouchers;
            optionSelect = 'fixed_value_vouchers';
        }

        var gbp = convertCurrencyToCode($('#coin').val());

        for (var i = 0; i < tempData.length; i++) {
            var productAmt = tempData[i].product_value;
            var priceAtm = tempData[i].retail_price;

            html += '<div class="col-sm-4"><div class="amounts2" data-product-id="' + tempData[i].product_id + '" data-price="' + priceAtm + '" data-service-id="' + tempData[i].service_id + '" data-operator-id="' + tempData[i].operator_id + '" data-country-id="' + tempData[i].country_id + '" data-optionselect="' + optionSelect + '">';
            html += '<a class="white-shdw-button" href="javascript:;">';
            html += parseFloat(productAmt).formatMoney(2, '.', ',') + ' ' + tempData[i].product_currency;
            html += '<span>' + tempData[i].product_name + '</span>'
            html += '<span>' + tempData[i].product_short_desc + '</span>'
            html += '<span class="prc">' + gbp + priceAtm + '</span>'
            html += '</a></div></div>';
        }

        if (variable_value_payments.length > 0) {
            tempData = variable_value_payments;
            optionSelect = 'variable_value_payments';

            for (var i = 0; i < tempData.length; i++) {
                html += '<div class="col-sm-4"><div class="amounts3" data-product-id="' + tempData[i].product_id + '" data-service-id="' + tempData[i].service_id + '" data-operator-id="' + tempData[i].operator_id + '" data-country-id="' + tempData[i].country_id + '" data-optionselect="' + optionSelect + '">';
                html += '<a class="white-shdw-button" href="javascript:;">';
                html += '<span>' + tempData[i].product_name + '</span>'
                html += '</a>';
                html += '<div class="plnAccountIDEnter" style="display:none">';
                html += gLangENTERPLNACCID + '<br/>';
                html += '<input type="text" maxlength="20" name="pln_account_id" class="pln_account_id" required /><br/>';
                html += '<span style="font-style:italic">' + gLangEXM + ' 546800060938</span>';
                html += '<br/>';
                html += '<button id="check-pln-account-btn_' + i + '" class="ladda-button check-pln-account-btn submit-btn" data-color="white" data-style="zoom-in" data-size="s"> <span class="ladda-label">NEXT</span> </button>';
                html += '<div style="float:none;clear:both;width:100%;height:10px;"></div>';
                html += '<div class="plnAvailableProductInfo" >';
                html += '</div>';
                html += '</div>';
                html += '</div></div>';
            }
        }

        html += '</div>';
    } else {
        html = '<div class="row"><div class="col-sm-12"><h5 class="info">' + gLangPROSERVICE + '</h5><hr></div></div>';
        html += '<div><br/><br/><span class="info">';
        html += gLangNORESULT + '</span>';
        html += '</div>';
    }

    $('#productsAvailList').slideDown().html(html);
}

window.showAvailableProductsForDestination = function (data, country_id, service_id, operator_id) {
    if(data.operator && data.operatorid && !data.product_list && !data.retail_price_list){
        showAllChoicesForUkUSDestinationOperators(data);
        return;
    }

    $('#productsAvailList').html('').hide();
    $('#operatorAvailList').hide().html('');
    window.gLangSECLECTOPR = 'Select amount to topup';
    var html = '<div class="row">';
    html += '<div class="col-sm-4 text-center"> <img style="display: inline-block" src="uploads/logo_operator/logo-' + data['operatorid'] + '-1.png" alt="' + data['operator'] + '"></div>';
    html += '<div class="col-sm-4">' + data['operator'];
    html += '</div></div>';

    html += '<div class="row"><div class="col-sm-12"><br><br><h5 class="info">' + gLangSECLECTOPR + '</h5><hr></div></div>';
    html += '<div class="row options amounts">';

    var product = data['product_list'].split(',');
    var price = data['retail_price_list'].split(',');
    var gbp = convertCurrencyToCode($('#coin').val());

    for (var i = 0; i < product.length; i++) {
        var productAmt = product[i];
        var priceAtm = price[i];
        html += '<div class="col-sm-3">';
        html += '<div class="amounts2" data-product="' + productAmt + '" data-price="' + priceAtm + '" data-service-id="' + service_id + '" data-operator-id="' + operator_id + '" data-country-id="' + country_id +'" >';
        html += '<a class="white-shdw-button" href="javascript:;" onclick="javascript: void (0)">';
        html += parseFloat(productAmt).formatMoney(2, '.', ',') + ' ' + data['destination_currency'];
        html += '<span>' + gbp + priceAtm + '</span>'
        html += '</a></div></div>';
    }
    html += '</div>';
    $('#productsAvailList').show().slideDown().html(html);
}

window.showAllChoicesForUkUSDestinationOperators = function(data){
    var operator = data.operator.split(',');
    var operatorid = data.operatorid.split(',');

    window.gLangSECLECTOPR = 'Select operator';
    window.gLangNORESULT2 = 'No result';

    $('#productsAvailList').html('').hide();
    $('#operatorAvailList').hide().html('');
    if (operator.length > 0) {
        var html = '<div class="row">';
        html += '<div class="col-sm-12"><br><h5 class="info">' + gLangSECLECTOPR + '</h5><hr></div>';
        html += '<div class="row options operator-option">';

        for (var i = 0; i < operator.length; i++) {
            html += '<div class="operatorWrapper">';
            html += '<input id="op_' + operatorid[i] + '" type="radio" name="select_operator" onclick="javascript: return selectOperatorTrigger(this);" data-operator-id="' + operatorid[i] + '" data-operator-name="' + operator[i] + '" data-country-id="' + data.countryid + '" data-service-id="' + 9999 + '" >';
            html += '<label for="op_' + operatorid[i] + '"><img src="uploads/logo_operator/logo-' + operatorid[i] + '-1.png" alt="' + operator[i] + '">';
            html += '' + operator[i];
            html += '</label></div>';
        }

        html += '</div>';
    } else {
        var html = '<div class="row">';
        html += '<br/><br/><span class="info">';
        html += gLangNORESULT2 + '</span>';
        html += '</div>';
    }
    $('#operatorAvailList').show().slideDown().html(html);
}