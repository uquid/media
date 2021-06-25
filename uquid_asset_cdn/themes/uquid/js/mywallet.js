/**
 * Created by Anh on 18/07/2017.
 */
$(function () {
    var clb = new Clipboard('[data-clipboard]', {
        text: function(trigger) {
            return trigger.getAttribute('data-clipboard');
        }
    });

    clb.on('success', function(e) {
        $(e.trigger).attr('title', 'Copied!');
        $(e.trigger).tooltip('fixTitle').tooltip('show');
        setTimeout(function () {
            $(e.trigger).attr('title', 'Copy address');
            $(e.trigger).tooltip('hide');
        },1000)
    });
    clb.on('error', function(e) {
        $(e.trigger).attr('title', 'Press Ctrl+C/Cmd+C to copy');
        $(e.trigger).tooltip('fixTitle').tooltip('show');
        setTimeout(function () {
            $(e.trigger).attr('title', 'Copy address');
            $(e.trigger).tooltip('hide');
        },1000)
    });

    $('[data-clipboard]').tooltip({trigger: 'manual'});

    var validator;
    $('#btnCreateWallet').on('click', function (e) {
        e.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                return $('<div>').load(href)
            },
            onshown: function (dialogRef) {
                setTimeout(function () {
                    initWizzard(dialogRef.$modal);
                }, 200)
            },
            title: "Create wallet"
        });
    });

    $(document).on('click', '#uqWalletBtn_activateWallet', function (e) {
        e.preventDefault();
        if (validator && validator.element('#activation_code')) {
            var partialForm = $(this).parents('#wrapActivationWalletSection');
            partialForm.find('.alert-danger').addClass('hide');
            UQAJAX.post({
                url: $(this).attr('data-post'),
                data: {activation_code: partialForm.find('#activation_code').val()},
                ladda: '#uqWalletBtn_activateWallet',
                success: function (resp) {
                    if (resp.status) {
                        var success = '<div class="alert alert-success">' + resp.message + '</div>';
                        partialForm.html(success);
                        reloadWalletList();
                    } else {
                        partialForm.find('.alert-danger').html(resp.message).removeClass('hide');
                    }
                },
                error: function (resp) {
                    // Show error message here
                    partialForm.find('.alert-danger').html(resp.message).removeClass('hide');
                }
            });
        }

    });

    function initWizzard(dialogRef) {
        var wz = dialogRef.find('.wizard');
        wz.wizard();
        var form = dialogRef.find('form');
        validator = form.validate({
            rules: {
                wallet_name: {
                    required: true
                },
                password: {
                    required: true,
                    securePassword: true,
                    regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
                },
                confirm_password: {
                    equalTo: "#password",
                },
                activation_code: {
                    required: true
                }
            }
        });
        wz.on('changed.fu.wizard', function (event, data) {
            if (data.step === 3) {
                wz.find('li.complete').removeClass('complete').find('.badge-success').removeClass('badge-success');
                wz.find('.actions .btn-prev').prop('disabled', true);
            }
            if (data.step === 4) {
                wz.find('li.complete').each(function () {
                    wz.find('.actions .btn-prev').prop('disabled', true);
                    if ($(this).index() < 2) {
                        $(this).removeClass('complete').find('.badge-success').removeClass('badge-success');
                    }
                });
                wz.find('.actions .btn-next').html('<span style="margin-left: 0" class="ladda-label">Complete</span>');
            }
        });

        wz.on('actionclicked.fu.wizard', function (event, data) {
            if (data.step === 1) {
                if (!validator.element('#wallet_name')) {
                    return false;
                }
            }

            if (data.step === 2) {
                event.preventDefault();
                if (!validator.element('#password') || !validator.element('#confirm_password')) {
                    return false;
                } else {
                    form.find('.alert-danger').addClass('hide');
                    UQAJAX.post({
                        url: form.attr('action'),
                        data: form.serialize(),
                        ladda: '.actions .btn-next',
                        success: function (resp) {
                            if (resp.status) {
                                wz.wizard('selectedItem', {step: 3});
                            } else {
                                form.find('.alert-danger').html(resp.message).removeClass('hide');
                            }
                        },
                        error: function (resp) {
                            // Show error message here
                            form.find('.alert-danger').html(resp.message).removeClass('hide');
                        }
                    });
                }
            }
        });

        wz.on('finished.fu.wizard', function (event, data) {
            if ($('#uqWalletBtn_activateWallet').length) {
                $('#uqWalletBtn_activateWallet').trigger('click');
            } else {
                $.each(BootstrapDialog.dialogs, function (id, dialog) {
                    dialog.close();
                });

                reloadWalletList();
            }
        });
    }

    function reloadWalletList() {
        UQAJAX.reload($('#myWalletList'), {
            whenComplete: function (doc) {
               // console.log(doc);
            }
        })
    }

    //////////////////////////////////////////////////////wallet page/////////////////////////////////

    function initActiveWalletForm(modal) {
        var form = modal.find('form');
        var validator = form.validate({
            rules: {
                activation_code: {
                    required: true
                }
            }
        });
        form.on('submit', function (e) {
            e.preventDefault();
            form.find('.alert').addClass('hide');

            if (form.valid()) {
                form.find('input[name="action"]').val('activate');
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#walletActivationBTN',
                    success: function (resp) {
                        if (resp.status) {
                            form.find('.alert-success').html(resp.message).removeClass('hide');
                            UQCALLBACK(resp.token, function () {
                                reloadWalletList();
                            });
                        } else {
                            form.find('.alert-danger').html(resp.message).removeClass('hide');
                        }
                    },
                    error: function (resp) {
                        form.find('.alert-danger').html(resp.message).removeClass('hide');
                    }
                });
            }
        })
    }

    function initRecoveryPasswordForm(modal) {
        var form = modal.find('form');
        var validator = form.validate({
            rules: {
                recovery_code: {
                    required: true
                },
                new_password: {
                    required: true,
                    securePassword: true,
                    regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
                },
                new_password2: {
                    equalTo: "#new_password"
                }
            }
        });

        form.on('submit', function (e) {
            e.preventDefault();

            if (form.valid()) {
                form.find('.alert').addClass('hide');
                form.find('input[name="action"]').val('recovery');
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#walletPasswordRecoveryBTN',
                    reloadUserBalances: false,
                    success: function (res) {
                        if (res.status) {
                            form.find('.alert-success').html(res.message).removeClass('hide');
                            form.trigger("reset");
                        } else {
                            form.find('.alert-danger').html(res.message).removeClass('hide');
                        }
                    },
                    error: function () {
                        form.find('.alert-danger').html('Internal error').removeClass('hide');
                    }
                });
            }
        });
    }

    function initDeleteWallet(div) {
        var form = div.find("#walletActionForm");

        form.find('#deleteWalletBTN').on('click', function (e) {
            e.preventDefault();

            form.find('.alert').addClass('hide');
            form.find('input[name="action"]').val('delete');
            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#deleteWalletBTN',
                reloadUserBalances: false,
                success: function (res) {
                    if (res.status) {
                        form.find('.alert-success').html(res.message).removeClass('hide');
                        UQCALLBACK(res.token, function () {
                            reloadWalletList();
                            setTimeout(function () {
                                $.each(BootstrapDialog.dialogs, function (id, dialog) {
                                    dialog.close();
                                });
                            }, 1000);
                        });
                    } else {
                        form.find('.alert-danger').html(res.message).removeClass('hide');
                    }
                },
                error: function () {
                    form.find('.alert-danger').html('Internal error').removeClass('hide');
                }
            });
        });
    }

    var myWalletList = $('#myWalletList');
    myWalletList.on("click", "a.action-activate-wallet", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initActiveWalletForm(div);
                })
            },
            title: "Activate wallet"
        });
    });

    myWalletList.on("click", "a.action-recovery-wallet-password", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initRecoveryPasswordForm(div);
                })
            },
            title: "Password recovery"
        });
    });

    myWalletList.on("click", "a.action-delete-wallet", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initDeleteWallet(div);
                })
            },
            title: "Delete wallet"
        });
    });

    //////////////////////////////////////////////my wallet details page/////////////////////////////
    function initMyReceiveAddress(div) {
        var form = div.find("#generateAddressForm");
        var addressQRcodeString = div.find('#addressQRcodeString');
        if (addressQRcodeString.length && addressQRcodeString.text()) {
            form.find('#updateAddressLabel').removeClass('hide');
            form.find('#addressQRcode').html('').qrcode({
                width: 150,
                height: 150,
                text: addressQRcodeString.text()
            });
        }

        div.find('#address_label').on('input', function (e) {
            e.preventDefault();
            if (
                form.find('input[name="address"]').val()
                && form.find('input[name="addressId"]').val()
                && form.find('input[name="addressHashing"]').val()
            ) {
                form.find('#updateAddressLabel').removeClass('hide');
            } else {
                form.find('#updateAddressLabel').addClass('hide');
            }
        });

        div.find('#updateAddressLabel').on('click', function (e) {
            e.preventDefault();
            form.find('#address_label').attr('required', true);
            if (form.valid()) {
                form.find('.alert').addClass('hide');
                form.find('input[name="action"]').val('update');
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#updateAddressLabel',
                    reloadUserBalances: false,
                    success: function (res) {
                        if (res.status) {
                            form.find('.alert-success').html(res.message).removeClass('hide');
                            UQCALLBACK(res.token, function () {
                                UQAJAX.reload($('#myReceiveAddress'), {
                                    whenComplete: function (doc) {
                                        //console.log(doc);
                                    }
                                });
                            });
                        } else {
                            form.find('.alert-danger').html(res.message).removeClass('hide');
                        }
                    },
                    error: function () {
                        form.find('.alert-danger').html('Internal error').removeClass('hide');
                    }
                });
            }
        });

        div.find("#generateWalletAddressBTN").on('click', function (e) {
            e.preventDefault();
            form.find('.alert').addClass('hide');
            form.find('input[name="address"]').val('');
            form.find('input[name="addressId"]').val('');
            form.find('input[name="addressHashing"]').val('');
            form.find('input[name="displayAddress"]').val('').attr('value', '');
            form.find('#addressQRcode').html('');
            form.find('#address_label').attr('required', false);

            form.find('input[name="action"]').val('generate');
            UQAJAX.post({
                url: form.attr('action'),
                data: form.serialize(),
                ladda: '#generateWalletAddressBTN',
                reloadUserBalances: false,
                success: function (res) {
                    if (res.status) {
                        form.find('input[name="address"]').val(res.address);
                        form.find('input[name="addressId"]').val(res.addressId);
                        form.find('input[name="addressHashing"]').val(res.addressHashing);
                        form.find('input[name="displayAddress"]').val(res.address).attr('value', res.address);
                        form.find('#addressQRcode').html('').qrcode({
                            width: 150,
                            height: 150,
                            text: res.address
                        });
                        $('#walletAddressInit').html(res.newWalletAddress);
                        UQCALLBACK(res.token, function () {
                            UQAJAX.reload($('#myReceiveAddress'), {
                                whenComplete: function (doc) {
                                    //console.log(doc);
                                }
                            });
                        });

                    } else {
                        form.find('.alert-danger').html(res.message).removeClass('hide');
                    }
                },
                error: function () {
                    form.find('.alert-danger').html('Internal error').removeClass('hide');
                }
            });
        });
    }

    $('#refreshWalletBalance').on('click', function (e) {
        e.preventDefault();

        var button = $(this);
        button.find('i').addClass('fa-spin');
        UQAJAX.post({
            url: button.attr('data-url'),
            data: {hash:button.attr('data-hash')},
            success: function (resp) {
                if (resp.status){
                    button.siblings('span').text(resp.message);
                    if(resp.address){
                        button.parents('row').find('#walletAddressInit').html(resp.address);
                    }
                }else{
                    alert(resp.message);
                }
                button.find('i').removeClass('fa-spin');
            },
            error: function () {
                button.find('i').removeClass('fa-spin');
            }
        })
    });

    $('#btnWalletReceive').on('click', function (e) {
        e.preventDefault();
        var href = $(this).attr('data-href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initMyReceiveAddress(div)
                })
            },
            title: "Receive Address"
        });
    });

    function initSendTransaction(div){
        var form = div.find("#walletActionForm");
        div.find('#walletSendBTN').on('click', function (e) {
            e.preventDefault();
            if (form.valid()) {
                form.find('.alert').addClass('hide');
                form.find('input[name="action"]').val('send');
                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#walletSendBTN',
                    reloadUserBalances: false,
                    success: function (res) {
                        form.find('#captchaIMG').html(res.cr);
                        form.find('#captcha').val('').attr('value','');

                        if (res.status) {
                            form.find('.alert-success').html(res.message).removeClass('hide');
                            UQCALLBACK(res.token, function () {
                                UQAJAX.reload($('#myReceiveAddress'), {
                                    whenComplete: function (doc) {
                                        //console.log(doc);
                                    }
                                });
                            });
                        } else {
                            form.find('.alert-danger').html(res.message).removeClass('hide');
                        }
                    },
                    error: function () {
                        form.find('.alert-danger').html('Internal error').removeClass('hide');
                    }
                });
            }
        });
    }

    $('#btnWalletSend').on('click', function (e) {
        e.preventDefault();
        var href = $(this).attr('data-href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_NORMAL,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initSendTransaction(div)
                })
            },
            title: "Send"
        });
    });


    var receiveAddressPartialView = $('#myReceiveAddress');
    receiveAddressPartialView.on("click", "a.action-show-qr-code", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_NORMAL,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    var str = div.find('#addressQRcode').text();
                    div.find('#addressQRcode').html('').qrcode({
                        width: 150,
                        height: 150,
                        text: str
                    });
                })
            },
            title: "QR Code"
        });
    });

    receiveAddressPartialView.on("click", "a.action-edit-label", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    initMyReceiveAddress(div);
                })
            },
            title: "Receive Address"
        });
    });

    receiveAddressPartialView.on("click", "a.action-delete-address", function (evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: function () {
                var div = $('<div>');
                return div.load(href, function () {
                    var form = div.find('form');
                    div.find('#deleteAddressBTN').on('click', function (e) {
                        e.preventDefault();

                        form.find('.alert').addClass('hide');
                        form.find('input[name="action"]').val('delete');
                        UQAJAX.post({
                            url: form.attr('action'),
                            data: form.serialize(),
                            ladda: '#deleteAddressBTN',
                            reloadUserBalances: false,
                            success: function (res) {
                                if (res.status) {
                                    form.find('.alert-success').html(res.message).removeClass('hide');
                                    UQCALLBACK(res.token, function () {
                                        UQAJAX.reload($('#myReceiveAddress'), {
                                            whenComplete: function (doc) {
                                                //console.log(doc);
                                            }
                                        });
                                    });
                                } else {
                                    form.find('.alert-danger').html(res.message).removeClass('hide');
                                }
                            },
                            error: function () {
                                form.find('.alert-danger').html('Internal error').removeClass('hide');
                            }
                        });
                    });
                })
            },
            title: "Delete Receive Address"
        });
    });

    $('#walletDetailsTabsController a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href") // activated tab
        if (target == '#transactions'){
            var view = $('#transactions #dynamicContent');
            if (view.children().length < 1){
                view.html('<tr><td align="center" colspan="99"><i class="fa fa-spinner fa-spin fa-fw"></i> Loading transactions</td>');
                loadTrans(view, $(e.target).attr('data-url'), $('#dynamicbutton'), function (view) {
                    view.html('')
                });
            }
        } else if (target == '#receive'){
            UQAJAX.reload($('#myReceiveAddress'), {
                whenComplete: function (doc) {
                }
            });
        }
    });

    $('#walletDetailsTabsController').on('click', '#btnRefreshTrans', function(evt){
        var btn = $(this).addClass('fa-spin');
        var view = $('#transactions #dynamicContent');
        $('#dynamicbutton').addClass('hide');
        view.html('<tr><td align="center" colspan="99"><i class="fa fa-spinner fa-spin fa-fw"></i> Loading transactions</td>');
        loadTrans(view, $(this).parent().attr('data-url'), $('#dynamicbutton'), function (view) {
            view.html('');
            btn.removeClass('fa-spin');
        });
    });

    $('#dynamicbutton').on('click', function (e) {
        e.preventDefault();
        var view = $('#transactions #dynamicContent');
        var btn = $(this);
        loadTrans(view, $(this).attr('data-url'), btn, function (view) {

        });
    });

    function loadTrans(view, url, btnLoadMore, beforeAppend) {
        btnLoadMore.find('i.fa').removeClass('hide');
        UQAJAX.get({
            url: url,
            dataType: 'html',
            success: function (resp) {
                btnLoadMore.find('i.fa').addClass('hide');
                var table = $('<table></table>').html(resp);
                if (table && table.find('.nextTransPageUrl').length > 0){
                    btnLoadMore.removeClass('hide');
                    btnLoadMore.attr('data-url', table.find('.nextTransPageUrl').attr('href'));
                    table.find('.nextTransPageUrl').parents('tr').remove();
                } else {
                    btnLoadMore.addClass('hide');
                }
                beforeAppend(view);
                view.append(table.html());
            }
        })
    }




    /////////////////////////////////////////////////////////////////////////////////////////////

});