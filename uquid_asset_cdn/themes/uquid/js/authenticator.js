/**
 * Created by Anh on 27/06/2017.
 */
$(document).ready(function(){
    var isSubmit = false;
    $("#error-alert").hide();
    $('.cancel-btn').on('click',function(e){
        document.location.href= p;
    });
    var form = $( "#login_submit" );
    form.on('submit', function(e){
        e.preventDefault();
        $("#error-alert").hide();
        if(form.valid() && !isSubmit){
            isSubmit = true;

            UQAJAX.post({
                url: form.attr('action'),
                data: {otpCode:$('#otpCode').val()},
                ladda: '#AuthenBTN',
                reloadUserBalances: true,
                success: function (res) {
                    isSubmit = false;
                    if(!res.status){
                        $("#error-alert").html(res.message).show();
                    }else{
                        document.location.href = res.redir;
                    }
                },
                error: function () {
                    console.warn('Status returns failure');
                }
            });
        }
    });
});