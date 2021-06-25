/**
 * Created by Anh on 01/07/2017.
 */

$(document).ready(function(){
    displayCurrency($('#account_currencies').val());
    $('#account_currencies').on('change',function(e){
        var vl = $(this).val();
        displayCurrency(vl);
    });
});