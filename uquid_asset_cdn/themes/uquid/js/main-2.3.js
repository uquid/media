$(function () {
    $('.dropdown').children('a').attr('class','dropdown-toggle').attr('data-toggle','dropdown').append('');
    $('.dropdown').children('ul').attr('class','dropdown-menu');
    $('[data-toggle="tooltip"]').tooltip();

    var idleTime = 0;
    setInterval(function () {
        idleTime = idleTime + 1;
        if (idleTime > 25) { // 25 minutes
            UQAJAX.post({
                url: '/account/login/auto_logout',
                data: {},
                success: function () {
                    window.location.reload();
                },
                error: function () {
                    window.location.reload();
                }
            });
        }
    }, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });

    $("#startTimeCountdown")
        .countdown($("#startTimeCountdown").attr('data-time'), function(event) {
            $(this).text(
                event.strftime('%D days %H:%M:%S')
            );
        });
});

