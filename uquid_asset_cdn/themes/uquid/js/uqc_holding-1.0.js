(function ($) {
    function bindingIconClicked() {
        $("#signup .left-half").on("click", ".item-deposit", function (e) {
            $(".item-deposit").removeClass("active");
            $(this).addClass("active");
            var rel = $(this).attr("rel");

            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load(depositUrl + "/" + rel),
                title: "Token order",
                cssClass: "initDepositModal0001"
            });
        });
    }

    function initTab() {
        $('#icoTabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href") // activated tab
            if (target == '#icoTrans') {
                $(target).reloadFragment({
                    url: window.preOrderUrl? window.preOrderUrl : window.location.href,
                    whenComplete: function () {
                    }
                });
            } else if (target == "#uqcorderStatus"){
                $(target).reloadFragment({
                    url: window.preOrderUrl? window.preOrderUrl : window.location.href,
                    whenComplete: function () {
                    }
                });
            } else if (target == "#uqcdeposit"){
                var clb = new Clipboard('#uqcaddresscopy');

                clb.on('success', function(e) {
                    $(e.trigger).attr('title', 'Copied!');
                    $(e.trigger).tooltip('fixTitle').tooltip('show');
                    console.log(e.trigger, 'copied');
                    setTimeout(function () {
                        $(e.trigger).attr('title', 'Copy address').attr('data-original-title', 'Copy address');
                        $(e.trigger).tooltip('hide');
                        console.log(e.trigger, 'copy');
                    },1000)
                });
                clb.on('error', function(e) {
                    $(e.trigger).attr('title', 'Press Ctrl+C/Cmd+C to copy');
                    $(e.trigger).tooltip('fixTitle').tooltip('show');
                    setTimeout(function () {
                        $(e.trigger).attr('title', 'Copy address').attr('data-original-title', 'Copy address');
                        $(e.trigger).tooltip('hide');
                    },1000)
                });
            }
        });
    }

    function initWithdrawQuestionContent() {
        $('#withdrawQuestionBtn i').on('mouseenter touchstart', function () {
            if ($(this).parents('li').hasClass('active')) {
                $(this).parents('li').find('.withdrawQuestionContent').removeClass('hide');
            }
        });

        $(document).on('click', '.withdrawQuestionContent .btnCloseWithdrawHelp', function () {
            $(this).parent().addClass('hide');
        });
    }

    function initRuleCountdown() {
        var schedules = [
            ["2017-10-02T10:00:00Z", "2017-10-07T22:00:00Z"],
            ["2017-10-07T22:00:00Z", "2017-10-13T10:00:00Z"],
            ["2017-10-13T10:00:00Z", "2017-10-19T22:00:00Z"],
            ["2017-10-19T22:00:00Z", "2017-11-10T10:00:00Z"]
        ];
        var bonus = ['20%', '10%', '5%', 'No offer'];
        var prices = ['1ETH = 208 UQC', '1 ETH = 185 UQC', '1 ETH = 175 UQC', '1 ETH = 166 UQC'];

        var today = moment();
        var currentPeriod = -1;
        var startSchedule;
        var endSchedule;
        for (var i = 0; i < schedules.length; i++) {
            startSchedule = moment(schedules[i][0]);
            endSchedule = moment(schedules[i][1]);
            if (today.isBefore(endSchedule) && today.isAfter(startSchedule)) {
                currentPeriod = i;
                break;
            }
        }
        var durationInDays = endSchedule.diff(today, 'hours');
        if (true) {
            // $('#icoCountdownRule').removeClass('hide');
            // $("#toNextTarget")
            //     .countdown(endSchedule.valueOf(), function(event) {
            //         $(this).text(
            //             event.strftime('%D days %H hrs %M mins %S sec')
            //         );
            //     });
        }
        var endDuration = moment(schedules[schedules.length-1][1]);

        $("#icoEndText")
            .countdown(endDuration.valueOf(), function(event) {
                $(this).text(
                    event.strftime('%D days') + ' to go' //%H:%M:%S
                );
            });
    }

    function initIcoDeposit() {
        var icoWrap = $('#icoWrap');
        if (!icoWrap.length) return;
        /*
        $(".realtime_deposit").on("click", function (e) {
            var rel = $(this).attr("rel");
            var name = $(this).attr("data-name");
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/ico_chl/?id=' + rel),
                title: "Buy UQC token with " + name
            });
        });

        $(".direct_deposit_bcc").on("click", function (e) {
            var rel = $(this).attr("rel");
            var name = $(this).attr("data-name");
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/ico_bcc/?id=' + rel),
                title: "Buy UQC token with " + name
            });
        });


        $('.check-direct-transaction-status').on('click', function (e) {
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/check_deposit_status_direct'),
                title: "Check status"
            });
        });
        $(".direct_deposit").on("click", function (e) {
            var rel = $(this).attr("rel");
            var name = $(this).attr("data-name");
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/ico_wl/?id=' + rel),
                title: "Buy UQC token with " + name
            });
        });*/

        $(".direct_deposit_uqblx").on("click", function (e) {
            var rel = $(this).attr("rel");
            var name = $(this).attr("data-name");
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/uqc_uqblx/'),
                title: "Buy UQC token with " + name
            });
        });
/*
        $(".direct_deposit_wex").on("click", function (e) {
            var rel = $(this).attr("rel");
            var name = $(this).attr("data-name");
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                message: $('<div>loading...</div>').load('account/deposit/ico_wex/'),
                title: "Buy UQC token with " + name
            });
        });*/

        var transactionSection = $('#icoTrans');
        var withdrawSection = $('#icoWithdraw');

        $('.myUQCBlx').on('click', function (e) {
            refreshUQCblx();
        });

        transactionSection.on('click', '#pagination a', function (e) {
            e.preventDefault();
            var link = $(this).attr('href');
            UQAJAX.get({
                url: link,
                dataType: 'html',
                success: function (res) {
                    transactionSection.html(res);
                },
                error: function () {
                    console.warn('Server error');
                }
            });
        });

        /*withdrawSection.on('click', 'a#btnWithdrawRequest', function (e) {
            e.preventDefault();
            var link = $(this).attr('href');
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_NORMAL,
                message: $('<div></div>').load(link),
                title: 'Withdraw request'
            });
        });*/

        withdrawSection.on('click', '#pagination a', function (e) {
            e.preventDefault();
            var link = $(this).attr('href');
            UQAJAX.get({
                url: link,
                dataType: 'html',
                success: function (res) {
                    withdrawSection.find('#myInvoiceList').html(res);
                },
                error: function () {
                    console.warn('Server error');
                }
            });
        });

        $('[data-toggle="tooltip"]').tooltip({
            placement: 'left'
        });

        $('#qr-code').qrcode(
            {
                width: 200,
                height: 200,
                text: $('#qr-code').attr('data-address')
            }
        );
    }

    function refreshUQCblx() {
        $('.myUQCBlx').addClass('fa-spin');
        UQAJAX.post({
            url: 'account/async/my_uqc_holding',
            success: function (res) {
                if (res.status) {
                    $('#myUQCBlx').text(res.message);
                } else {
                    reload();
                }
                $('.myUQCBlx').removeClass('fa-spin');
            },
            error: function () {
                console.warn('Server error');
                $('.myUQCBlx').removeClass('fa-spin');
            }
        });
    }


    function showTransactionDetails(hash) {
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<div></div>').load('account/async/uqc_holding_transaction_reveal/?hash=' + hash),
            title: 'Transaction details'
        });
    }

    /*function showInvoiceDetails(hash) {
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<div></div>').load('account/async/ico_invoice_reveal/?hash=' + hash),
            title: 'Invoice details'
        });
    }*/

    function initDepositUquidBalance() {
        var form = $("#direct_deposit_uq_submit");
        form.validate();
        $(document).on('click', "#direct_deposit_uq_submit .submit-btn", function (e) {
            e.preventDefault();
            var form = $(this).parents("form");
            form.find(".alert").hide();

            if (form.valid()) {
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#depositBTN',
                    reloadUserBalances: true,
                    success: function (res) {
                        if (!res.status) {
                            $(form).find("#error-alert").show().html(res.message);
                        } else {
                            $(form).find("#success-alert").show().html(res.message);
                            $(form)[0].reset();
                        }
                    },
                    error: function () {
                        console.warn('Server error');
                    }
                });
            }
        });

        $(document).on('click', '#calcEstCrd', function (e) {
            var _this = this;
            var form = $(this).parents("form");
            form.find(".alert").hide();
            if (form.valid()) {
                if ("true" !== $(_this).attr('data-loading')) {
                    $(_this).attr('data-loading', 'true');
                    $(_this).find('span').removeClass('hidden');

                    var obj = {
                        amount: $(form).find('#amount').val(),
                        currency: $(form).find('#currency').val(),
                        action: 'get_estimation_credit',
                        type: form.find('input[name="type"]').val()
                    };

                    UQAJAX.post({
                        url: form.attr('action'),
                        data: obj,
                        reloadUserBalances: false,
                        success: function (res) {
                            $(_this).find('span').addClass('hidden');
                            $(_this).attr('data-loading', 'false');
                            if (!res.status) {
                                $(form).find("#error-alert").show().html(res.message);
                            } else {
                                $(form).find('.EstCreditId').html(res.message);
                            }
                        },
                        error: function () {
                            console.warn('Status returns failure');
                        }
                    });
                }
            }
        });
    }

    function showInvoiceDetails(hash) {
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<div></div>').load('account/async/ico_invoice_reveal/?hash=' + hash),
            title: 'Invoice details'
        });
    }

    $(document).ready(function () {
        bindingIconClicked();
        initTab();
        initIcoDeposit();
        initWithdrawQuestionContent();
        initRuleCountdown();
        initDepositUquidBalance();
    });

    window.bindingIconClicked = bindingIconClicked;
    window.showTransactionDetails = showTransactionDetails;
    window.showInvoiceDetails = showInvoiceDetails;
})(jQuery);