Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


if (location.host === 'uquid.com') {
    console = console || {};
    console.log = function(){};
}

$(function () {
    $.validator.addMethod(
        "regex",
        function (value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Please check your input."
    );

    $.validator.addMethod('securePassword', function (value) {
            //var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
            //return re.test(str);

            //return /^(((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20}))$/.test(value);
            return value.length >= 6;
        }, 'Your password must be at least 6 characters'
        //'Passwords must contain both Letters (both lowercase and uppercase characters) and Numbers and be 6 characters long or more.'
    );

    $.validator.addMethod('etherAddress', function (value) {
        return UQAJAX.isEtherAddress(value);
    }, 'Your ethereum wallet address is invalid.');

    $.validator.addMethod('filesize', function (value, element, param) {
        // param = size (in bytes)
        // element = element to validate (<input>)
        // value = value of the element (file name)
        return this.optional(element) || (element.files[0].size <= param)
    });

    function displayCurrency(code){
        if("undefined" == typeof currencies){return;}

        if(code != 'exchange'){
            var valueAmt = currencies[code];
            $('#account_currencies_amount').text(valueAmt);
        }else{
            location.href = exchangeURL; // exchangeURL is global variable
        }
    }

    function sysUpdateBalance(obj){
        var test = true;
        if(obj.accountBalance && !$.isEmptyObject(obj.accountBalance)){
            currencies = obj.accountBalance; // currencies is global variable
            displayCurrency($('#account_currencies').val());
        }
    }

    function updateUserBalances(xhr, textStatus) {
        if (textStatus == 'success') {
            if (xhr.responseJSON) {
                sysUpdateBalance(xhr.responseJSON);
            }
        }
        window.isAjaxRunningUQGlb = false;
    }

    window.displayCurrency = displayCurrency;

    window.isAjaxRunningUQGlb = false;

    $.ajaxSetup({
        dataType: 'json',
        beforeSend: function (xhr, obj) {
            // we dont check ajax running when crossDomain = true
            if (!obj.crossDomain){
                if (window.isAjaxRunningUQGlb) {
                    return false;
                }
                window.isAjaxRunningUQGlb = true;
            } else {
                xhr.crossDomain = true;
            }
        },
        complete: function (xhr, status) {
            if (!xhr.crossDomain){
                xhr.crossDomain = false;
                window.isAjaxRunningUQGlb = false;
                if (status == 'parsererror' || status == 'error') {
                    if (location.host === 'uquid.com') location.reload();
                }
            }

        },
        success: function(xhr, status){
            if (!xhr.crossDomain) {
                window.isAjaxRunningUQGlb = false;
                xhr.crossDomain = false;
            }
        }
    });

    window.UQURL = function(url){
        var csrfStr = '&' + $.param(window.csrf);
        if (url.indexOf('?') === -1) {
            url += '?';
        }
        url += csrfStr;
        return url;
    };

    window.UQCALLBACK = function(token, func){
        window.isAjaxRunningUQGlb = false;
        window.csrf = token;
        if (typeof func === 'function'){ func()}
    }

    window.UQAJAX = {
        get: function (options) {
            if (options.reloadUserBalances) {
                options.complete = updateUserBalances;
            }
            var l;
            if (options.ladda) {
                var d = $(options.ladda);
                if (d.length) {
                    l = Ladda.create(d[0]);
                    l.start();
                }
            }
            var csrf = window.csrf;
            if (csrf) {
                if (typeof options.processData !== 'undefined' && !options.processData) {
                    var csrfStr = '&' + $.param(csrf);
                    if (options.url.indexOf('?') === -1) {
                        options.url += '?';
                    }
                    options.url += csrfStr;
                } else {
                    if (typeof options.data === 'object') {
                        options.data = $.extend({}, options.data, csrf);
                    } else if (typeof options.data === 'string') {
                        options.data += '&' + $.param(csrf);
                    } else if (!options.data) {
                        options.data = $.param(csrf);
                    }
                }
            }
            return $.ajax(options).always(function () {
                var textStatus = arguments[1];
                if (textStatus == 'success') {
                    var data = arguments[0];
                    if (data.token) {
                        window.csrf = data.token;
                    }
                } else {
                    if (location.hostname != 'uquid.com') {
                        console.error('Please reload the page to get new csrf!');
                    }
                }
                l && l.stop();
            });
        },
        post: function (options) {
            options.type = 'post';
            return this.get(options);
        },
        reload: function (jqElement, options) {
            if (!options){
                options = {};
            }
            return jqElement.reloadFragment({
                url: options.url,
                whenComplete: function (doc) {
                    if (typeof options.whenComplete == 'function') {
                        options.whenComplete.call(null, doc);
                    }
                    window.isAjaxRunningUQGlb = false;
                }
            });
        }
    };

    var _load = $.fn.load;
    $.fn.load = function (url, params, callback) {
        var csrfStr = '&' + $.param(window.csrf);
        if (url.indexOf('?') === -1) {
            url += '?';
        }
        url += csrfStr;
        return _load.apply(this, [url, params, callback]);
    };

    window.popitup = function (url) {
        newwindow = window.open(url, 'uquid', 'height=600,width=950');
        if (window.focus) {
            newwindow.focus()
        }
        return false;
    }

    window.closeit = function () {
        newwindow.close();
    }

    window.convertCurrencyToCode = function (currency) {
        currency = currency.toLowerCase();

        if (currency === 'usd') return '$';

        if (currency === 'eur' || currency == 'euro') return '&euro;';

        if (currency === 'gbp') return '&pound;';

        if (currency === 'uqc') return 'UQC: ';

        currency = currency.toUpperCase() + ': ';

        return currency;
    }

    window.checkCookieToRefreshPage = function () {
        var requiredRefresh = $.cookie('requiredRefresh');
        if (typeof requiredRefresh != 'undefined' && requiredRefresh == '1') {
            $.removeCookie('requiredRefresh', {path: '/'});
            location.href = location.href;
        }
    }

    /**
     * Checks if the given string is an address
     *
     * @method isAddress
     * @param {String} address the given HEX adress
     * @return {Boolean}
     */
    UQAJAX.isEtherAddress = function (address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // check if it has the basic requirements of an address
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            return isChecksumAddress(address);
        }
    };

    /**
     * Checks if the given string is a checksummed address
     *
     * @method isChecksumAddress
     * @param {String} address the given HEX adress
     * @return {Boolean}
     */
    var isChecksumAddress = function (address) {
        // Check each case
        address = address.replace('0x','');
        var addressHash = keccak256(address.toLowerCase());
        for (var i = 0; i < 40; i++ ) {
            // the nth letter should be uppercase if the nth digit of casemap is 1
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    };

});

