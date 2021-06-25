/**
 * Created by Anh on 06/07/2017.
 */
(function ($) {
    $(document).ready(function () {
        $('#dob').datepicker({
            format: 'mm/dd/yyyy',
            endDate: '12/30/2010'
        });
        var form = $("#register_submit");
        form.validate({
            messages: {
                password: {
                    regex: "Password should be alphabet letters, numbers or special characters like !@#$%"
                },
                security_code: {
                    regex: "Security code should be alphabet letters, numbers or special characters like !@#$%"
                }
            },
            rules: {
                email: "email",
                password: {
                    required: true,
                    securePassword: true,
                    regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
                },
                password2: {
                    equalTo: "#password"
                },
                security_code: {
                    regex: /^[a-zA-Z0-9~`@!#$%^&*()_+={[}\]\/\\?,>< ]*$/
                }
            }
        });

        form.on('submit', function (e) {
            e.preventDefault();
            var iCheck = $("#register_submit").valid();

            $('#error-alert').hide();
            if (iCheck) {

                UQAJAX.post({
                    url: form.attr('action'),
                    data: form.serialize(),
                    ladda: '#registerBTN',
                    success: function (res) {
                        if (res.status) {
                            document.location.href = res.redirect_url;
                        } else {
                            $('#error-alert').show().html(res.message);
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
})(jQuery);