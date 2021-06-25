function toogle2FA() {
    var form = $("#profile_submit");
    UQAJAX.post({
        url: form.attr('action'),
        data: form.serialize() + '&whatsave=enableGoogleAuthenticator',
        success: function (res) {
            if (!res.status) {
                $('#enableGoogleAuthenticator').prop('checked', false);
                alert(res.message);
            } else {
                //console.warn('Server error');
            }
        },
        error: function () {
            console.warn('Server error');
        }
    });
}
$(document).ready(function () {
    $('#enableGoogleAuthenticator').on('click', function (e) {
        if ($(this).prop('checked')) {
            gFADialog = BootstrapDialog.show({
                message: $('<div></div>').load(g2faUrl),
                title: 'Google 2FA',
                onhide: function (ref) {
                    if (!isEnable2FA) {
                        $('#enableGoogleAuthenticator').prop('checked', false);
                    }
                }
            });
        } else {
            toogle2FA();
        }
    });

    $('.api-settings').on('click', function (e) {
        BootstrapDialog.show({
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<div></div>').load(apiUrl),
            title: apiLabel
        });
    });

    $('.telegram-settings').on('click', function (e) {
        BootstrapDialog.show({
            message: $('<div></div>').load(telegramTokenUrl),
            title: telegramTokenLabel
        });
    });

    $('.cancelFieldsLink').on('click', function (e) {
        var pos = $(this).attr('data-pos');
        $(this).hide();
        $('button[data-pos="' + pos + '"]').hide();
        $('a[data-pos="' + pos + '"].changeFieldsLink').show();
        $('.' + pos).attr('disabled', 'disabled');
    });
    $('.changeFieldsLink').on('click', function (e) {
        $('.cancelFieldsLink').click();

        var pos = $(this).attr('data-pos');
        $(this).hide();
        $('button[data-pos="' + pos + '"]').show();
        $('a[data-pos="' + pos + '"].cancelFieldsLink').show();
        $('.' + pos).removeAttr('disabled');
    });

    $('#dob').datepicker({
        format: 'mm/dd/yyyy',
        endDate: '12/30/2010'
    });

    var form = $("#profile_submit");
    form.validate({
        messages: {
            old_password: {
                regex: "Password should be alphabet letters, numbers or special characters like !@#$%"
            },
            password: {
                regex: "Password should be alphabet letters, numbers or special characters like !@#$%"
            },
            security_code: {
                regex: "Password should be alphabet letters, numbers or special characters like !@#$%"
            }
        },
        rules: {
            email: "email",
            old_password: {
                required: true,
                securePassword: true,
                regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
            },
            password: {
                required: true,
                securePassword: true,
                regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
            },
            password2: {
                equalTo: "#password",
            },
            security_code: {
                regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,><]*$/
            }
        }
    });
    form.on('submit', function (e) {
        e.preventDefault();
        var pos = $('.changeFieldsLink[style*="display: none"]').attr('data-pos');
        $('#error-alert').hide();
        if (form.valid()) {
            var laddaSelector = pos === 'saveInfo' ? '.submit-btn' : '.btn2';
            UQAJAX.post({
                url: form.attr('action'),
                ladda: laddaSelector,
                data: form.serialize() + '&whatsave=' + pos,
                reloadUserBalances: true,
                success: function (res) {
                    if (res.status) {
                        $('#success-alert').show().html(res.message);

                        if(res.redir){
                            location.reload();
                        }

                        window.setTimeout(function () {
                            $('.cancelFieldsLink').click();
                            $('#success-alert').hide();
                        }, 3500);

                    } else {
                        $('#error-alert').show().html(res.message);
                    }
                    if (pos == 'saveInfo') {
                        $('html, body').scrollTop($(document).height());
                    }
                },
                error: function () {
                    console.warn('Server error');
                }
            });
        }
    });

    $('.btnShowCode').on('click', function (e) {
        e.preventDefault();

        var codeField = $(this).siblings('input');
        var type = codeField.attr('type');
        if (type === 'password') {
            codeField.attr('type', 'text');
        } else {
            codeField.attr('type', 'password');
        }
        $(this).find('i').toggleClass('fa-eye').toggleClass('fa-eye-slash');
    });
});