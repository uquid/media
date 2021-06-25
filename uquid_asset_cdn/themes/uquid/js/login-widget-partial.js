/**
 * Created by Anh on 27/06/2017.
 */
$(document).ready(function(){
    $(".alert").hide();
    if($.trim( $("#error-alert").text() ).length > 0){
        $("#error-alert").show();
    }
    var form = $( "#login_submit" );
    form.validate();
});